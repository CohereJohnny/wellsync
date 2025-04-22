import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  console.log('GET /api/chat_history: Received request');
  try {
    const { searchParams } = new URL(request.url);
    const wellId = searchParams.get('wellId');
    console.log(`GET /api/chat_history: wellId=${wellId}`);

    if (!wellId) {
      console.log('GET /api/chat_history: wellId is missing');
      return NextResponse.json({ error: 'wellId is required' }, { status: 400 });
    }

    console.log('GET /api/chat_history: Querying Supabase...');
    // Fetch all matching rows, order by updated_at descending to get the latest if duplicates exist
    const { data: historyRows, error } = await supabaseAdmin
      .from('chat_history')
      .select('messages')
      .eq('well_id', wellId)
      .order('updated_at', { ascending: false }); // Order by most recent
      // Removed .maybeSingle()

    if (error) {
      console.error('GET /api/chat_history: Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`GET /api/chat_history: Supabase query successful. Found ${historyRows?.length || 0} rows.`);
    // If multiple rows were found (due to previous bug), use the most recent one (first in the ordered list)
    const latestHistory = historyRows && historyRows.length > 0 ? historyRows[0] : null;
    const messages = latestHistory ? latestHistory.messages : [];
    console.log(`GET /api/chat_history: Returning ${messages.length} messages from the latest record.`);
    return NextResponse.json({ messages });

  } catch (err: any) {
    console.error('GET /api/chat_history: Caught general error:', err);
    return NextResponse.json({ error: err.message || 'Error fetching chat history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wellId, messages: newMessages } = body;
    if (!wellId || !Array.isArray(newMessages)) {
      return NextResponse.json({ error: 'wellId and messages array are required.' }, { status: 400 });
    }

    // Fetch existing chat history if exists
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .select('messages')
      .eq('well_id', wellId)
      .single();

    let updatedMessages = newMessages;
    if (data && data.messages) {
      updatedMessages = [...data.messages, ...newMessages];
      const { error: updateError } = await supabaseAdmin
         .from('chat_history')
         .update({ messages: updatedMessages, updated_at: new Date() })
         .eq('well_id', wellId);
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabaseAdmin
           .from('chat_history')
           .insert([{ well_id: wellId, messages: updatedMessages }]);
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ messages: updatedMessages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating chat history' }, { status: 500 });
  }
} 