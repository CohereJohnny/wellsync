import { NextResponse } from 'next/server';

// Define expected request body structure for ordering a part
interface OrderRequestBody {
  part_id?: string;
  quantity?: number;
  destination_well_id?: string;
}

// POST handler for the order simulation endpoint
export async function POST(request: Request) {
  console.log('POST /api/orders: Received request');

  let requestBody: OrderRequestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    console.error('POST /api/orders: Invalid JSON body', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { part_id, quantity, destination_well_id } = requestBody;

  // --- Input Validation ---
  if (!part_id || typeof part_id !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid part_id' }, { status: 400 });
  }
  if (quantity === undefined || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: 'Missing, invalid, or non-positive integer quantity' }, { status: 400 });
  }
  if (!destination_well_id || typeof destination_well_id !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid destination_well_id' }, { status: 400 });
  }

  console.log(`POST /api/orders: Simulating order for part=${part_id}, quantity=${quantity}, well=${destination_well_id}`);

  try {
    // --- Simulation Logic ---
    // In a real application, this would interact with an ERP or ordering system.
    // For now, we just log it.
    console.log(`Simulated Order Success: Part ${part_id} x ${quantity} for Well ${destination_well_id}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Order successfully simulated for ${quantity} unit(s) of part ${part_id} for well ${destination_well_id}.`,
    });

  } catch (error) {
    console.error('POST /api/orders: Error during simulation:', error);
    const message = error instanceof Error ? error.message : 'Internal server error during order simulation';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
} 