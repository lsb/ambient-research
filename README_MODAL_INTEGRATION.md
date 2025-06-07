# Modal Integration for Ambient Research

This document describes the Modal integration for GPU-accelerated audio transcription and LLM processing.

## Overview

The integration consists of:

1. **Modal Endpoints** (`modal_endpoints.py`) - FastAPI app deployed on Modal with GPU inference
2. **TypeScript Integration** - Direct HTTP calls to Modal endpoints from frontend
3. **Audio Processing Pipeline** - Integration with existing mu6 audio encoding

## Components

### Modal Endpoints

- **Transcribe Endpoint**: `/transcribe` - Converts mu6-encoded audio to text using Whisper
- **LLM Endpoint**: `/llm` - Generates text using Qwen3-32B model

### TypeScript Integration

- `/api/upload` - Enhanced to automatically transcribe uploaded audio via direct Modal calls
- Frontend calls Modal endpoints directly via HTTP

## Deployment

### Deploy Modal Endpoints

```bash
# Install Modal CLI if not already installed
pip install modal

# Deploy the endpoints
python deploy_modal.py
```

### Configure Environment Variables

No environment variables needed - Modal endpoints are called directly from frontend code.

### Run the TypeScript App

```bash
cd ambient-research-web-app
npm install
npm run dev
```

## Usage

### Audio Transcription

The existing audio upload flow now automatically includes transcription:

1. Audio is captured using mu6 encoding (as before)
2. Audio data is stored in the database (as before)
3. Audio is automatically sent to Modal for transcription
4. Transcription result is returned alongside the upload response

### Direct Modal API Usage

Call the Modal endpoints directly from your frontend:

```javascript
// Transcribe audio
const response = await fetch('https://lsb--lsb-ambient-research-accelerated-models-fastapi-app.modal.run/transcribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ audio_data: mu6String })
});

// Generate text
const response = await fetch('https://lsb--lsb-ambient-research-accelerated-models-fastapi-app.modal.run/llm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: "Your prompt here" })
});
```

## Audio Format

The system uses mu6 encoding for audio compression:

- Audio is captured at 16kHz sample rate
- Encoded using mu-law compression with base64-like palette
- Palette: `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_`

## Error Handling

- Modal endpoints include retry logic and error responses
- TypeScript routes handle Modal API failures gracefully
- Audio upload continues to work even if transcription fails
