import { NextRequest, NextResponse } from 'next/server';

const MODAL_ENDPOINT = process.env.MODAL_LLM_ENDPOINT || 'https://lsb--lsb-ambient-research-accelerated-models-fastapi-app.modal.run/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.text) {
      return NextResponse.json(
        { error: 'Missing text field' },
        { status: 400 }
      );
    }

    const response = await fetch(MODAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: body.text
      })
    });

    if (!response.ok) {
      throw new Error(`Modal API responded with status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response: result.response
    });

  } catch (error) {
    console.error('Error calling Modal LLM endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate text',
        message: error instanceof Error ? error.message : 'Unknown error'
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
