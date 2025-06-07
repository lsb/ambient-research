-- CreateTable
CREATE TABLE "audio_recordings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "audio_data" TEXT NOT NULL,
    "client_timestamp" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "server_timestamp" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "idx_conversation_id" ON "audio_recordings"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_client_timestamp" ON "audio_recordings"("client_timestamp");
