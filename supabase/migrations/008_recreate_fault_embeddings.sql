-- Migration to drop and recreate fault_embeddings table with correct schema

-- Drop the existing table if it exists
DROP TABLE IF EXISTS fault_embeddings;

-- Recreate the table with the correct schema
CREATE TABLE fault_embeddings (
    id BIGSERIAL PRIMARY KEY,
    -- Correct FK referencing faults(fault_id) which is assumed to be UUID
    fault_id UUID NOT NULL REFERENCES faults(fault_id) ON DELETE CASCADE,
    embedding vector(1024) NOT NULL, -- Dimension for Cohere Embed v3/v4 models
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Recreate the index for faster similarity search
CREATE INDEX fault_embeddings_embedding_idx
ON fault_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); 