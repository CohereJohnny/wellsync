-- Migration to create search_faults RPC function

CREATE OR REPLACE FUNCTION search_faults (
  query_embedding vector(1024),
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  -- Define columns matching the 'faults' table or desired subset
  id BIGINT,
  well_id TEXT,
  part_id TEXT,
  "timestamp" TIMESTAMPTZ, -- Quoted reserved keyword
  fault_type TEXT,
  status TEXT,
  -- Add other fault columns as needed
  similarity float -- Include the similarity score
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.well_id,
    f.part_id,
    f.timestamp,
    f.fault_type,
    f.status,
    -- Add other fault columns here
    1 - (fe.embedding <=> query_embedding) AS similarity
  FROM fault_embeddings fe
  JOIN faults f ON fe.fault_id = f.id
  WHERE 1 - (fe.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC -- Order by score descending (most similar first)
  LIMIT match_count;
END;
$$; 