# Database Function: `search_faults`

This PostgreSQL function performs a vector similarity search on the `faults` table using pre-computed embeddings.

## Signature

```sql
CREATE OR REPLACE FUNCTION search_faults (
  query_embedding vector(1024),
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  fault_id uuid,
  well_id uuid,
  part_id varchar(10),
  timestamp timestamp,
  fault_type varchar(50),
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
    1 - (f.embedding <=> query_embedding) AS similarity
  FROM
    faults f
  WHERE 1 - (f.embedding <=> query_embedding) > similarity_threshold
  ORDER BY
    f.embedding <=> query_embedding
  LIMIT
    match_count;
END;
$$;
```

## Parameters

- **`query_embedding`** (`vector(1024)`, required): The 1024-dimension embedding vector generated from the user's search query (e.g., using Cohere `embed-english-v3.0`).
- **`similarity_threshold`** (`float`, required): The minimum cosine similarity score required for a fault to be considered a match. A value between 0 and 1. Typically set around 0.5 to 0.7.
- **`match_count`** (`int`, required): The maximum number of initial matches to return, ordered by similarity.

## Returns

A table containing fault records that meet the similarity threshold, ordered by descending similarity (most similar first), and limited by `match_count`. Each row includes:

- `fault_id` (uuid)
- `well_id` (uuid)
- `part_id` (varchar(10))
- `timestamp` (timestamp)
- `fault_type` (varchar(50))
- `similarity` (float): The calculated cosine similarity between the query embedding and the fault's embedding.

## Usage

This function is intended to be called from a backend service (like the `/api/search_faults` route) that provides the query embedding. It performs the initial vector search using the `<=>` operator provided by the `pgvector` extension.

**Example Call (within Supabase RPC):**

```javascript
const { data, error } = await supabase.rpc('search_faults', {
  query_embedding: embeddingVector, // Array of 1024 numbers
  similarity_threshold: 0.5,
  match_count: 30
});
```

## Dependencies

- Requires the `pgvector` PostgreSQL extension to be enabled.
- Assumes the `faults` table exists and has an `embedding` column of type `vector(1024)` with an appropriate index (e.g., HNSW or IVFFlat) for efficient searching. 