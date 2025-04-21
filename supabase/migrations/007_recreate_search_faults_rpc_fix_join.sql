-- Migration to DROP and RECREATE search_faults RPC (correct JOIN, use faults.id)

-- Drop the previous version
DROP FUNCTION IF EXISTS search_faults(vector, double precision, integer);

-- Create the function with corrected JOIN and SELECT columns
CREATE OR REPLACE FUNCTION search_faults (
  query_embedding vector(1024),
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  id BIGINT, -- Return the actual PK from faults table
  well_id TEXT,
  part_id TEXT,
  "timestamp" TIMESTAMPTZ,
  fault_type TEXT,
  -- Removed status as it appears not to exist on faults table
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id, -- Select the PK from faults
    f.well_id,
    f.part_id,
    f.timestamp,
    f.fault_type,
    -- Removed f.status
    1 - (fe.embedding <=> query_embedding) AS similarity
  FROM fault_embeddings fe
  -- Correct JOIN condition: fe.fault_id references f.id
  JOIN faults f ON fe.fault_id = f.id
  WHERE 1 - (fe.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$; 