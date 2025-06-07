import modal
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = modal.App("lsb-ambient-research-accelerated-models")

MODEL_CACHE_PATH = "/root/models"
inference_image = modal.Image.debian_slim(python_version="3.12").pip_install(
    "accelerate",
    "huggingface_hub[hf_transfer]",
    "numpy",
    "torch",
    "transformers",
    "optimum-quanto",
    "fastapi",
    "pydantic",
).env(
    {"HF_HUB_CACHE": MODEL_CACHE_PATH, "HF_HUB_ENABLE_HF_TRANSFER": "1"}
)
model_cache = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

ASR_MODEL_NAME = "openai/whisper-large-v3-turbo"
MODEL_REVISION = "main"

LLM_MODEL_NAME = "Qwen/Qwen3-32B"
MODEL_REVISION = "main"

def setup():
    from transformers import pipeline, QuantoConfig
    import torch
    asrpipe = pipeline("automatic-speech-recognition", model=ASR_MODEL_NAME, device_map="auto", torch_dtype=torch.float16)
    llmpipe = pipeline("text-generation", model=LLM_MODEL_NAME, device_map="auto", quantization_config=QuantoConfig(weights="float8")) if torch.cuda.is_available() else pipeline("text-generation", model=LLM_MODEL_NAME, device_map="auto", torch_dtype=torch.float32)
    mu6palette = b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
    mu6palette_to_int = torch.zeros((128,), dtype=torch.float32) / 0.0
    for i, c in enumerate(mu6palette):
        mu6palette_to_int[c] = i

    return asrpipe, llmpipe, mu6palette_to_int

@app.cls(
    gpu="h100",
    retries=3,
    volumes={MODEL_CACHE_PATH: model_cache},
    image=inference_image,
    max_containers=5,
)
class Inference:
    @modal.enter()
    def load_models(self):
        self.asrpipe, self.llmpipe, self.mu6palette_to_int = setup()
    
    @modal.method()
    def transcribe(self, mu_string):
        import torch
        mu_string = torch.tensor(list(mu_string), dtype=torch.int32)
        mu_bytes = self.mu6palette_to_int[mu_string]
        mu_floats = ((mu_bytes / 63) * 2.0) - 1.0
        mu_floats = torch.sign(mu_floats) * (torch.exp(torch.abs(mu_floats) * torch.log1p(torch.tensor(63))) - 1.0) / 63

        if torch.any(torch.isnan(mu_floats)):
            return None

        return self.asrpipe(mu_floats.numpy(), return_timestamps=True)
    
    @modal.method()
    def llm(self, text):
        return self.llmpipe(text, max_new_tokens=40000)

class TranscribeRequest(BaseModel):
    audio_data: str

class LLMRequest(BaseModel):
    text: str

class TranscribeResponse(BaseModel):
    transcription: Optional[dict]
    error: Optional[str] = None

class LLMResponse(BaseModel):
    response: Optional[list]
    error: Optional[str] = None

web_app = FastAPI()
inference_instance = Inference()

@web_app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(request: TranscribeRequest):
    try:
        result = inference_instance.transcribe.remote(request.audio_data)
        if result is None:
            return TranscribeResponse(transcription=None, error="Invalid audio data")
        return TranscribeResponse(transcription=result)
    except Exception as e:
        return TranscribeResponse(transcription=None, error=str(e))

@web_app.post("/llm", response_model=LLMResponse)
async def generate_text(request: LLMRequest):
    try:
        result = inference_instance.llm.remote(request.text)
        return LLMResponse(response=result)
    except Exception as e:
        return LLMResponse(response=None, error=str(e))

@app.function(image=inference_image)
@modal.asgi_app()
def fastapi_app():
    return web_app
