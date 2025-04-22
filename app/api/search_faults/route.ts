import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server'; // Import the server-side client
import { cohere } from '@/lib/cohere'; // Existing Cohere client

// Define expected request body structure
interface SearchRequestBody {
  query?: string;
  wellId?: string;
}

// Define structure for results from search_faults RPC
// Based on migration 013
interface FaultSearchResult {
  fault_id: string; // UUID
  well_id: string; // UUID
  part_id: string; // varchar(10)
  timestamp: string; // Actual type is TIMESTAMP, but will likely be stringified
  fault_type: string; // varchar(50)
  similarity: number;
}

// POST handler for the search endpoint
export async function POST(request: Request) {
  console.log('POST /api/search_faults: Received request');

  let requestBody: SearchRequestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    console.error('POST /api/search_faults: Invalid JSON body', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { query, wellId } = requestBody;

  // --- Input Validation ---
  if (!query || typeof query !== 'string') {
    console.log('POST /api/search_faults: Missing or invalid query');
    return NextResponse.json({ error: 'Missing or invalid query parameter' }, { status: 400 });
  }
  if (!wellId || typeof wellId !== 'string') {
    // We might not strictly need wellId for semantic search itself, 
    // but could use it later for filtering or context. Keeping validation for now.
    console.log('POST /api/search_faults: Missing or invalid wellId');
    return NextResponse.json({ error: 'Missing or invalid wellId parameter' }, { status: 400 });
  }

  console.log(`POST /api/search_faults: Processing query="${query}", wellId=${wellId}`);

  try {
    // --- Initialize Clients ---
    console.log('POST /api/search_faults: Clients initialized');

    // --- 1. Generate Query Embedding ---
    console.log('POST /api/search_faults: Generating query embedding...');
    let queryEmbedding: number[];
    try {
      const embedResponse = await cohere.embed({
        texts: [query],
        model: 'embed-english-v3.0',
        inputType: 'search_query', // Important: use 'search_query' for query embeddings
      });
      
      // Explicitly check the structure and type assertion
      if (
        !embedResponse || 
        !embedResponse.embeddings || 
        !Array.isArray(embedResponse.embeddings) || 
        embedResponse.embeddings.length === 0 || 
        !Array.isArray(embedResponse.embeddings[0])
        ) {
        console.error('Invalid embedding structure received:', embedResponse);
        throw new Error('Cohere Embed API did not return valid embeddings for query.');
      }
      
      // Type assertion to number[][] before accessing
      queryEmbedding = (embedResponse.embeddings as number[][])[0]; 
      console.log(`POST /api/search_faults: Query embedding generated (dimensions: ${queryEmbedding.length})`);
    } catch (embedError) {
      console.error('POST /api/search_faults: Cohere embed error:', embedError);
      throw new Error(`Failed to generate query embedding: ${embedError instanceof Error ? embedError.message : embedError}`);
    }

    // --- 2. Call Supabase RPC for Initial Search ---
    console.log('POST /api/search_faults: Calling search_faults RPC...');
    const SIMILARITY_THRESHOLD = 0.5; // Start broad, Rerank will refine
    const MATCH_COUNT = 30;           // Get enough candidates for Rerank

    const { data: initialResults, error: rpcError } = await supabaseAdmin.rpc('search_faults', { 
      query_embedding: queryEmbedding,
      similarity_threshold: SIMILARITY_THRESHOLD,
      match_count: MATCH_COUNT,
    });

    if (rpcError) {
      console.error('POST /api/search_faults: Supabase RPC error:', rpcError);
      throw new Error(`Failed to search faults via RPC: ${rpcError.message}`);
    }

    if (!initialResults) {
        console.log('POST /api/search_faults: RPC returned null/undefined results');
        return NextResponse.json([]); // Return empty array if no results
    }
    
    console.log(`POST /api/search_faults: Received ${initialResults.length} initial results from RPC.`);

    // --- 3. Rerank Integration ---
    if (initialResults.length === 0) {
      console.log('POST /api/search_faults: No initial results to rerank, returning empty array.');
      return NextResponse.json([]);
    }

    // Format documents for Rerank API
    // Add explicit type to map parameter
    const documentsToRerank = initialResults.map((fault: FaultSearchResult, index: number) => {
      const timestampStr = fault.timestamp ? new Date(fault.timestamp).toLocaleString() : 'Unknown time';
      return {
        index: index, // Use direct index from map
        text: `Fault Type: ${fault.fault_type || 'N/A'}, Timestamp: ${timestampStr}, Part ID: ${fault.part_id || 'N/A'}, Well ID: ${fault.well_id || 'N/A'}`,
        originalData: fault 
      };
    });

    console.log(`POST /api/search_faults: Formatted ${documentsToRerank.length} documents for reranking.`);

    // Call Cohere Rerank API
    const RERANK_TOP_N = 5; // Number of results to return after reranking
    let rerankedResults = [];
    try {
      console.log('POST /api/search_faults: Calling Cohere Rerank API...');
      const rerankResponse = await cohere.rerank({
        query: query,
        documents: documentsToRerank.map((doc: { text: string }) => doc.text), 
        topN: RERANK_TOP_N,
        model: 'rerank-english-v2.0', // Or use a newer model if available
      });

      // Add explicit type to result parameter
      rerankedResults = rerankResponse.results.map((result: { index: number; relevanceScore: number }) => { 
        const originalDoc = documentsToRerank[result.index];
        return {
          ...originalDoc.originalData,
          rerank_score: result.relevanceScore,
        };
      });

      console.log(`POST /api/search_faults: Received ${rerankedResults.length} results after reranking.`);

    } catch (rerankError) {
      console.error('POST /api/search_faults: Cohere rerank error:', rerankError);
      // Decide how to handle rerank errors: return initial results or throw error?
      // For now, let's return the initial (unranked by relevance) results
      console.warn('POST /api/search_faults: Rerank failed, returning initial RPC results.');
      return NextResponse.json(initialResults); // Fallback to initial results
      // OR: throw new Error(`Failed to rerank results: ${rerankError.message}`); 
    }

    // --- 4. API Response ---
    console.log('POST /api/search_faults: Sending reranked results.');
    return NextResponse.json(rerankedResults);

  } catch (error) {
    console.error('POST /api/search_faults: Error during processing:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 