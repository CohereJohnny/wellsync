-- Add unique constraint to well_id in chat_history table

ALTER TABLE chat_history
ADD CONSTRAINT chat_history_well_id_key UNIQUE (well_id); 