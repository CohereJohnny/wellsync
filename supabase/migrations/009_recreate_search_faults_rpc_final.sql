-- Migration to DROP and RECREATE search_faults RPC (use faults.fault_id UUID)

-- Drop the previous version
DROP FUNCTION IF EXISTS search_faults(vector, double precision, integer);

-- Create the function selecting faults.fault_id
CREATE OR REPLACE FUNCTION search_faults (
  query_embedding vector(1024),
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  fault_id UUID, -- Return the actual PK (UUID) from faults table
  well_id TEXT,
  part_id TEXT,
  "timestamp" TIMESTAMPTZ,
  fault_type TEXT,
  -- Status column likely doesn't exist on faults, removed
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.fault_id, -- Select the PK (UUID) from faults
    f.well_id,
    f.part_id,
    f.timestamp,
    f.fault_type,
    1 - (fe.embedding <=> query_embedding) AS similarity
  FROM fault_embeddings fe
  -- Correct JOIN condition: fe.fault_id references f.fault_id
  JOIN faults f ON fe.fault_id = f.fault_id
  WHERE 1 - (fe.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$; 