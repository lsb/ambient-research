import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const audioData = formData.get('audio_data') as string;
    const clientTimestamp = formData.get('client_timestamp') as string;
    const conversationId = formData.get('conversation_id') as string;

    if (!audioData || !clientTimestamp || !conversationId) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          required: ['audio_data', 'client_timestamp', 'conversation_id'] 
        },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const recording = await db.insertAudioRecording({
      audio_data: audioData,
      client_timestamp: clientTimestamp,
      conversation_id: conversationId
    });

    return NextResponse.json({
      success: true,
      id: recording.id,
      server_timestamp: recording.server_timestamp,
      message: 'Audio data stored successfully'
    });

  } catch (error) {
    console.error('Error storing audio data:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to store audio data'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    },
    { status: 405 }
  );
}
