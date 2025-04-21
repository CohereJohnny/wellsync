-- Migration to DROP and RECREATE search_faults RPC (correct fault_type type)

-- Drop the previous version
DROP FUNCTION IF EXISTS search_faults(vector, double precision, integer);

-- Create the function with corrected RETURNS TABLE definition for fault_type
CREATE OR REPLACE FUNCTION search_faults (
  query_embedding vector(1024),
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  fault_id UUID,
  well_id UUID,
  part_id character varying(10),
  "timestamp" TIMESTAMP,
  fault_type character varying(50), -- Corrected type to varchar(50)
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
    1 - (fe.embedding <=> query_embedding) AS similarity
  FROM fault_embeddings fe
  JOIN faults f ON fe.fault_id = f.fault_id
  WHERE 1 - (fe.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$; 