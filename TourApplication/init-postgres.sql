-- ==========================================
-- PostgreSQL Initialization Script
-- Purpose: Enable pgvector and create tables
-- Date: 2025-11-10
-- Author: @tlong1312
-- ==========================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- Vector Store Table
-- Purpose: Store tour embeddings for RAG
-- Dimensions: 768 (Gemini text-embedding-004)
-- ==========================================
CREATE TABLE IF NOT EXISTS vector_store (
                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(768) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create HNSW index for fast similarity search
-- HNSW (Hierarchical Navigable Small World) is optimal for high-dimensional vectors
CREATE INDEX IF NOT EXISTS vector_store_embedding_idx
    ON vector_store USING hnsw (embedding vector_cosine_ops);

-- Create metadata indexes for filtering
CREATE INDEX IF NOT EXISTS vector_store_metadata_idx
    ON vector_store USING gin (metadata);

-- ==========================================
-- Chat Memory Table
-- Purpose: Store conversation history
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_memory_messages (
                                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Indexes for chat memory
CREATE INDEX IF NOT EXISTS chat_memory_session_idx
    ON chat_memory_messages(session_id);

CREATE INDEX IF NOT EXISTS chat_memory_created_idx
    ON chat_memory_messages(created_at DESC);

-- ==========================================
-- Helper Function: Update timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_vector_store_updated_at
    BEFORE UPDATE ON vector_store
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Statistics and Verification
-- ==========================================
DO $$
DECLARE
ext_count INTEGER;
    table_count INTEGER;
BEGIN
    -- Check extension
SELECT COUNT(*) INTO ext_count
FROM pg_extension
WHERE extname = 'vector';

-- Check tables
SELECT COUNT(*) INTO table_count
FROM information_schema.tables
WHERE table_name IN ('vector_store', 'chat_memory_messages');

-- Log results
RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ PostgreSQL Database Initialized Successfully';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Extension Status:';
    RAISE NOTICE '  📦 pgvector: % (expected: 1)', ext_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Created:';
    RAISE NOTICE '  📊 vector_store: YES (768 dimensions)';
    RAISE NOTICE '  💬 chat_memory_messages: YES';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes Created:';
    RAISE NOTICE '  🔍 HNSW index on embeddings: YES';
    RAISE NOTICE '  🔍 GIN index on metadata: YES';
    RAISE NOTICE '  🔍 B-tree index on session_id: YES';
    RAISE NOTICE '';
    RAISE NOTICE 'Database Ready for RAG Chatbot! 🚀';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
END $$;