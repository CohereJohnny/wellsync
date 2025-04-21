import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts'; // Assuming shared CORS headers
// Removed Cohere SDK import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log('generate-fault-embedding function initializing...');

const COHERE_API_KEY = Deno.env.get('COHERE_API_KEY');
const COHERE_API_URL = 'https://api.cohere.ai/v1/embed'; // Cohere Embed API endpoint

if (!COHERE_API_KEY) {
  console.error('COHERE_API_KEY environment variable not set!');
}

// Initialize Supabase client (requires PROJECT_URL and SUPABASE_SERVICE_ROLE_KEY env vars)
const supabaseAdmin = createClient(
  Deno.env.get('PROJECT_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Received request:', req.method);
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json();
    console.log('Payload received:', payload);

    // Check if it's an INSERT event for the faults table
    if (payload.type !== 'INSERT' || payload.table !== 'faults') {
      console.log('Ignoring non-fault INSERT event.');
      return new Response(JSON.stringify({ message: 'Not a fault insert event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const newFault = payload.record;
    if (!newFault || !newFault.fault_id) {
      console.error('Invalid fault record in payload:', newFault);
      throw new Error('Invalid fault record received (missing fault_id)');
    }

    console.log(`Processing fault ID: ${newFault.fault_id}, Type: ${newFault.fault_type}`);

    // --- Text Preparation for Embedding ---
    const textToEmbed = `Fault Type: ${newFault.fault_type || 'Unknown'}. Status: ${newFault.status || 'Unknown'}`;
    console.log(`Text to embed: "${textToEmbed}"`);

    // --- Call Cohere Embed API using fetch ---
    if (!COHERE_API_KEY) throw new Error('Cohere API Key is not configured.');
    
    console.log('Calling Cohere Embed API via fetch...');
    const cohereResponse = await fetch(COHERE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        texts: [textToEmbed],
        model: 'embed-english-v3.0', // Ensure model matches expected dimensions
        input_type: 'search_document', // Correct parameter name is input_type
      }),
    });

    if (!cohereResponse.ok) {
      const errorBody = await cohereResponse.text();
      console.error(`Cohere API error: ${cohereResponse.status} ${cohereResponse.statusText}`, errorBody);
      throw new Error(`Failed to generate embedding: ${cohereResponse.statusText}`);
    }

    const cohereData = await cohereResponse.json();

    if (!cohereData.embeddings || cohereData.embeddings.length === 0) {
      console.error('Cohere Embed API response did not contain embeddings:', cohereData);
      throw new Error('Failed to parse embedding from Cohere response');
    }

    const embedding = cohereData.embeddings[0];
    console.log(`Embedding generated (first few dimensions): ${embedding.slice(0, 5)}...`);

    // --- Store Embedding in Supabase ---
    console.log('Storing embedding in fault_embeddings table...');
    const { error: insertError } = await supabaseAdmin
      .from('fault_embeddings')
      .insert({
        fault_id: newFault.fault_id,
        embedding: embedding,
      });

    if (insertError) {
      console.error('Error inserting embedding:', insertError);
      throw new Error(`Failed to store embedding: ${insertError.message}`);
    }

    console.log(`Embedding stored successfully for fault ID: ${newFault.fault_id}`);

    return new Response(JSON.stringify({ success: true, faultId: newFault.fault_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

console.log('generate-fault-embedding function ready.'); 