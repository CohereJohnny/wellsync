import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server'; // Import the server-side client

// Define expected request body structure for dispatching a part
interface DispatchRequestBody {
  part_id?: string;
  quantity?: number;
  source_warehouse_id?: string;
  destination_well_id?: string;
}

// POST handler for the dispatch simulation endpoint
export async function POST(request: Request) {
  const startTime = Date.now(); // Start timer
  console.log('POST /api/dispatches: Received request');

  let requestBody: DispatchRequestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    console.error('POST /api/dispatches: Invalid JSON body', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { part_id, quantity, source_warehouse_id, destination_well_id } = requestBody;

  // --- Input Validation ---
  if (!part_id || typeof part_id !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid part_id' }, { status: 400 });
  }
  if (quantity === undefined || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: 'Missing, invalid, or non-positive integer quantity' }, { status: 400 });
  }
   if (!source_warehouse_id || typeof source_warehouse_id !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid source_warehouse_id' }, { status: 400 });
  }
  if (!destination_well_id || typeof destination_well_id !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid destination_well_id' }, { status: 400 });
  }

  console.log(`POST /api/dispatches: Simulating dispatch for part=${part_id}, quantity=${quantity}, from=${source_warehouse_id}, to=${destination_well_id}`);

  try {
    // --- Simulation Logic --- 
    
    // 1. Check current stock level
    console.log(`POST /api/dispatches: [${Date.now() - startTime}ms] Fetching inventory...`);
    const { data: inventoryItem, error: fetchError } = await supabaseAdmin
      .from('inventory')
      .select('id, stock_level') // Select id for update and stock_level for check
      .eq('part_id', part_id)
      .eq('warehouse_id', source_warehouse_id)
      .single(); // Expecting unique part/warehouse combo
    console.log(`POST /api/dispatches: [${Date.now() - startTime}ms] Fetched inventory.`);

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // PostgREST error code for "exact one row not found"
        console.error(`POST /api/dispatches: [${Date.now() - startTime}ms] Inventory item not found for part ${part_id} in warehouse ${source_warehouse_id}`);
        return NextResponse.json({ success: false, error: `Part ${part_id} not found in warehouse ${source_warehouse_id}.` }, { status: 404 });
      }
      console.error(`POST /api/dispatches: [${Date.now() - startTime}ms] Error fetching inventory:`, fetchError);
      throw new Error(`Failed to fetch inventory: ${fetchError.message}`);
    }

    if (!inventoryItem) {
         console.error(`POST /api/dispatches: [${Date.now() - startTime}ms] Inventory item is null/undefined after fetch for part ${part_id} in warehouse ${source_warehouse_id}`);
         return NextResponse.json({ success: false, error: `Part ${part_id} not found in warehouse ${source_warehouse_id}.` }, { status: 404 });
    }

    console.log(`POST /api/dispatches: [${Date.now() - startTime}ms] Current stock for ${part_id} in ${source_warehouse_id} is ${inventoryItem.stock_level}`);

    // 2. Check if stock is sufficient
    if (inventoryItem.stock_level < quantity) {
      console.warn(`POST /api/dispatches: [${Date.now() - startTime}ms] Insufficient stock for part ${part_id}. Required: ${quantity}, Available: ${inventoryItem.stock_level}`);
      return NextResponse.json({
        success: false,
        error: `Insufficient stock for part ${part_id} in warehouse ${source_warehouse_id}. Required: ${quantity}, Available: ${inventoryItem.stock_level}.`,
      }, { status: 409 }); // 409 Conflict might be appropriate
    }

    // 3. Update stock level (Decrement)
    const newStockLevel = inventoryItem.stock_level - quantity;
    console.log(`POST /api/dispatches: [${Date.now() - startTime}ms] Attempting to update stock for ${part_id} to ${newStockLevel}`);
    
    const { error: updateError } = await supabaseAdmin
      .from('inventory')
      .update({ stock_level: newStockLevel, last_updated: new Date().toISOString() })
      .eq('id', inventoryItem.id); // Update using the specific row ID
      // Consider adding .eq('stock_level', inventoryItem.stock_level) for optimistic concurrency check
    console.log(`POST /api/dispatches: [${Date.now() - startTime}ms] Updated stock attempt completed.`);

    if (updateError) {
      console.error(`POST /api/dispatches: [${Date.now() - startTime}ms] Error updating inventory:`, updateError);
      throw new Error(`Failed to update inventory: ${updateError.message}`);
    }

    console.log(`POST /api/dispatches: [${Date.now() - startTime}ms] Stock updated successfully for part ${part_id}.`);

    // Return success response
    console.log(`POST /api/dispatches: [${Date.now() - startTime}ms] Sending success response.`);
    return NextResponse.json({
      success: true,
      message: `Successfully dispatched ${quantity} unit(s) of part ${part_id} from warehouse ${source_warehouse_id} to well ${destination_well_id}. New stock: ${newStockLevel}.`,
    });

  } catch (error) {
    console.error(`POST /api/dispatches: [${Date.now() - startTime}ms] Error during simulation:`, error);
    const message = error instanceof Error ? error.message : 'Internal server error during dispatch simulation';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
} 