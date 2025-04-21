# Semantic Search Backend Documentation (Sprint 11)

This document details the backend components implemented in Sprint 11 to enable semantic search functionality for faults.

## 1. `fault_embeddings` Table

This table stores the vector embeddings generated from fault data.

**Schema Definition:**

```sql
CREATE TABLE IF NOT EXISTS fault_embeddings (
    id BIGSERIAL PRIMARY KEY,
    fault_id BIGINT NOT NULL REFERENCES faults(id) ON DELETE CASCADE,
    embedding vector(1024) NOT NULL, -- Dimension for Cohere Embed v3/v4 models
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

- **`id`**: Unique identifier for the embedding record.
- **`fault_id`**: Foreign key referencing the `faults` table. Ensures that if a fault is deleted, its corresponding embedding is also deleted (due to `ON DELETE CASCADE`).
- **`embedding`**: The vector embedding itself. Stored using the `vector` type from the `pgvector` extension. The dimension `1024` matches the output of Cohere's `embed-english-v3.0` model.
- **`created_at`**: Timestamp indicating when the embedding was generated and stored.

**Index:**

```sql
CREATE INDEX IF NOT EXISTS fault_embeddings_embedding_idx
ON fault_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

- An IVFFlat index is created on the `embedding` column using cosine distance (`vector_cosine_ops`). This significantly speeds up similarity searches.
- `lists = 100` is a parameter for the index; the optimal value might depend on the total number of embeddings.

## 2. `generate-fault-embedding` Edge Function

This Supabase Edge Function automatically generates and stores an embedding whenever a new fault is inserted.

**Location:** `supabase/functions/generate-fault-embedding/index.ts`

**Trigger:**
- Configured via a **Supabase Database Webhook**.
- Listens for `INSERT` events on the `public.faults` table.
- Invokes the deployed Edge Function via a POST request.

**Core Logic:**
1. Receives the webhook payload containing the newly inserted `fault` record.
2. Extracts relevant text data from the fault (currently `fault_type` and `status`).
3. Calls the Cohere Embed API (`v1/embed`) using `fetch`:
   - Sends the extracted text.
   - Uses the `embed-english-v3.0` model.
   - Specifies `input_type: 'search_document'`.
4. Parses the embedding vector from the Cohere API response.
5. Inserts a new record into the `fault_embeddings` table, linking the `fault_id` with the generated `embedding` vector.
6. Handles errors during API calls or database inserts.

**Required Environment Variables (Secrets):**
- `COHERE_API_KEY`: Your Cohere API key.
- `PROJECT_URL`: Your Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (required for admin privileges to insert into the table).

## 3. `search_faults` PostgreSQL RPC Function

This database function performs the vector similarity search.

**Definition:**

```sql
CREATE OR REPLACE FUNCTION search_faults (
  query_embedding vector(1024),
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  id BIGINT,
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
    f.id,
    f.well_id,
    f.part_id,
    f.timestamp,
    f.fault_type,
    f.status,
    1 - (fe.embedding <=> query_embedding) AS similarity
  FROM fault_embeddings fe
  JOIN faults f ON fe.fault_id = f.id
  WHERE 1 - (fe.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

**Parameters:**
- `query_embedding vector(1024)`: The embedding vector (generated from the user's search query) to search against.
- `similarity_threshold float`: A value between 0 and 1. Only results with a cosine similarity score *greater* than this threshold will be returned (e.g., 0.7).
- `match_count int`: The maximum number of matching faults to return.

**Returns:**
- A table containing details of the matching faults (`id`, `well_id`, `part_id`, `timestamp`, `fault_type`, `status`) along with the calculated `similarity` score.

**Logic:**
1. Calculates the cosine similarity between the input `query_embedding` and each `embedding` in the `fault_embeddings` table. The `<=>` operator calculates cosine distance, so `1 - distance` gives similarity.
2. Filters results to include only those above the `similarity_threshold`.
3. Joins with the `faults` table to retrieve details of the matching faults.
4. Orders the results by `similarity` score in descending order (most similar first).
5. Limits the number of returned results to `match_count`.

**Usage (from Supabase Client):**
```javascript
const { data, error } = await supabase.rpc('search_faults', {
  query_embedding: embeddingVector,      // Array of numbers (vector)
  similarity_threshold: 0.75,            // Example threshold
  match_count: 5                         // Example limit
});
``` 