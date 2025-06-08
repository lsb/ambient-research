#!/usr/bin/env python3
"""
Deploy script for Modal endpoints
"""
import subprocess
import sys

def main():
    try:
        print("Deploying Modal endpoints...")
        result = subprocess.run([
            "modal", "deploy", "gpu_models_on_modal.py"
        ], check=True, capture_output=True, text=True)
        
        print("Deployment successful!")
        print(result.stdout)
        
        print("\nModal endpoints are now available at:")
        print("- Transcribe: https://lsb--lsb-ambient-research-accelerated-models-fastapi-app.modal.run/transcribe")
        print("- LLM: https://lsb--lsb-ambient-research-accelerated-models-fastapi-app.modal.run/llm")
        
    except subprocess.CalledProcessError as e:
        print(f"Deployment failed: {e}")
        print(f"Error output: {e.stderr}")
        sys.exit(1)

if __name__ == "__main__":
    main()
