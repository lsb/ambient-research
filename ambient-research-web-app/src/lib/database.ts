import Database from 'better-sqlite3';
import path from 'path';

export interface AudioRecording {
  id?: number;
  audio_data: string;
  client_timestamp: string;
  conversation_id: string;
  server_timestamp: string;
}

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.NODE_ENV === 'production' 
      ? path.join(process.cwd(), 'data', 'ambient-research.db')
      : path.join(process.cwd(), 'ambient-research.db');
    
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS audio_recordings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audio_data TEXT NOT NULL,
        client_timestamp TEXT NOT NULL,
        conversation_id TEXT NOT NULL,
        server_timestamp TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_conversation_id ON audio_recordings(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_client_timestamp ON audio_recordings(client_timestamp);
    `;

    this.db.exec(createTableQuery);
    this.db.exec(createIndexQuery);
  }

  insertAudioRecording(recording: Omit<AudioRecording, 'id' | 'server_timestamp'>): AudioRecording {
    const serverTimestamp = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO audio_recordings (audio_data, client_timestamp, conversation_id, server_timestamp)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      recording.audio_data,
      recording.client_timestamp,
      recording.conversation_id,
      serverTimestamp
    );

    return {
      id: result.lastInsertRowid as number,
      ...recording,
      server_timestamp: serverTimestamp
    };
  }

  getRecordingsByConversation(conversationId: string): AudioRecording[] {
    const stmt = this.db.prepare(`
      SELECT * FROM audio_recordings 
      WHERE conversation_id = ? 
      ORDER BY client_timestamp ASC
    `);

    return stmt.all(conversationId) as AudioRecording[];
  }

  close() {
    this.db.close();
  }
}

let dbInstance: DatabaseManager | null = null;

export function getDatabase(): DatabaseManager {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
  }
  return dbInstance;
}
