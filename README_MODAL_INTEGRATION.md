# Modal Integration for Ambient Research

This document describes the Modal integration for GPU-accelerated audio transcription and LLM processing.

## Overview

The integration consists of:

1. **Modal Endpoints** (`modal_endpoints.py`) - FastAPI app deployed on Modal with GPU inference
2. **TypeScript API Routes** - Next.js API routes that proxy requests to Modal
3. **Audio Processing Pipeline** - Integration with existing mu6 audio encoding

## Components

### Modal Endpoints

- **Transcribe Endpoint**: `/transcribe` - Converts mu6-encoded audio to text using Whisper
- **LLM Endpoint**: `/llm` - Generates text using Qwen3-32B model

### TypeScript API Routes

- `/api/transcribe` - Proxy to Modal transcribe endpoint
- `/api/llm` - Proxy to Modal LLM endpoint
- `/api/upload` - Enhanced to automatically transcribe uploaded audio

## Deployment

### Deploy Modal Endpoints

```bash
# Install Modal CLI if not already installed
pip install modal

# Deploy the endpoints
python deploy_modal.py
```

### Configure Environment Variables

Copy `.env.local.example` to `.env.local` and update the Modal endpoint URLs:

```bash
cp .env.local.example .env.local
```

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

### Direct API Usage

You can also call the endpoints directly:

```javascript
// Transcribe audio
const response = await fetch('/api/transcribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ audio_data: mu6String })
});

// Generate text
const response = await fetch('/api/llm', {
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
