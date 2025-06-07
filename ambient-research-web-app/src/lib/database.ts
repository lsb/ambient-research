import { PrismaClient } from '@prisma/client';

export interface AudioRecording {
  id?: number;
  audio_data: string;
  client_timestamp: string;
  conversation_id: string;
  server_timestamp: string;
}

class DatabaseManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async insertAudioRecording(recording: Omit<AudioRecording, 'id' | 'server_timestamp'>): Promise<AudioRecording> {
    const serverTimestamp = new Date().toISOString();
    
    const result = await this.prisma.audioRecording.create({
      data: {
        audioData: recording.audio_data,
        clientTimestamp: recording.client_timestamp,
        conversationId: recording.conversation_id,
        serverTimestamp: serverTimestamp,
      },
    });

    return {
      id: result.id,
      audio_data: result.audioData,
      client_timestamp: result.clientTimestamp,
      conversation_id: result.conversationId,
      server_timestamp: result.serverTimestamp,
    };
  }

  async getRecordingsByConversation(conversationId: string): Promise<AudioRecording[]> {
    const recordings = await this.prisma.audioRecording.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        clientTimestamp: 'asc',
      },
    });

    return recordings.map(record => ({
      id: record.id,
      audio_data: record.audioData,
      client_timestamp: record.clientTimestamp,
      conversation_id: record.conversationId,
      server_timestamp: record.serverTimestamp,
    }));
  }

  async close() {
    await this.prisma.$disconnect();
  }
}

let dbInstance: DatabaseManager | null = null;

export function getDatabase(): DatabaseManager {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
  }
  return dbInstance;
}
