-- Migration to create fault_embeddings table

-- Ensure the vector extension is enabled (should already be from Sprint 2)
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS fault_embeddings (
    id BIGSERIAL PRIMARY KEY,
    fault_id BIGINT NOT NULL REFERENCES faults(id) ON DELETE CASCADE,
    embedding vector(1024) NOT NULL, -- Dimension for Cohere Embed v3/v4 models
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optional: Index for faster similarity search
CREATE INDEX IF NOT EXISTS fault_embeddings_embedding_idx
ON fault_embeddings
USING ivfflat (embedding vector_cosine_ops) -- Using ivfflat for potential performance,hnsw is another option
WITH (lists = 100); -- Adjust lists based on expected data size 