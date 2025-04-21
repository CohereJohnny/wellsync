-- Migration to create chat_history table

CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    well_id TEXT NOT NULL,
    messages JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
); 