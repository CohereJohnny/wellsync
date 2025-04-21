-- Migration to DROP and RECREATE search_faults RPC function (use fault_id)

-- Drop the old function first
DROP FUNCTION IF EXISTS search_faults(vector, double precision, integer);

-- Create the new function with corrected column names
CREATE OR REPLACE FUNCTION search_faults (
  query_embedding vector(1024),
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  fault_id UUID, -- Assuming fault_id is UUID based on previous logs
  well_id TEXT,
  part_id TEXT,
  "timestamp" TIMESTAMPTZ,
  fault_type TEXT,
  status TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.fault_id,
    f.well_id,
    f.part_id,
    f.timestamp,
    f.fault_type,
    f.status,
    1 - (fe.embedding <=> query_embedding) AS similarity
  FROM fault_embeddings fe
  JOIN faults f ON fe.fault_id = f.fault_id
  WHERE 1 - (fe.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$; 