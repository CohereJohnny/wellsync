import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Extract fields, including resource type information
    const { wellId, transformerId, partId, faultType, description } = await request.json()

    // Determine if this is a well or transformer fault
    const isTransformer = !!transformerId;
    const resourceId = isTransformer ? transformerId : wellId;
    const resourceTable = isTransformer ? 'transformers' : 'wells';
    const resourceIdField = isTransformer ? 'transformer_id' : 'well_id';

    if (!resourceId) {
      throw new Error('Either wellId or transformerId must be provided');
    }

    // Fetch part specifications for the serial number
    const { data: partData, error: partError } = await supabaseAdmin
      .from('parts')
      .select('specifications')
      .eq('part_id', partId)
      .single();

    if (partError && partError.code !== 'PGRST116') { // Not found is ok, but other errors should throw
      throw new Error(`Error fetching part details: ${partError.message}`);
    }

    // Extract part specifications
    const partSpecifications = partData?.specifications || null;

    // Start a Supabase transaction
    const { data: fault, error: faultError } = await supabaseAdmin
      .from('faults')
      .insert([
        {
          [resourceIdField]: resourceId,
          part_id: partId,
          fault_type: faultType,
          description: description || `${faultType} fault detected`, // Use provided description or default
          timestamp: new Date().toISOString(),
          part_specifications: partSpecifications // Add part specifications to fault
        },
      ])
      .select()
      .single()

    if (faultError) {
      throw faultError
    }

    // Update resource status and fault details
    const { error: resourceError } = await supabaseAdmin
      .from(resourceTable)
      .update({ 
        status: 'Fault',
        fault_details: {
          part_id: partId,
          fault_type: faultType,
          description: description || null, // Add description to resource's fault_details (or null)
          part_specifications: partSpecifications // Add part specifications to fault_details
        }
      })
      .eq('id', resourceId)

    if (resourceError) {
      throw resourceError
    }

    return NextResponse.json(fault)
  } catch (error: any) {
    console.error('Error creating fault:', error)
    return NextResponse.json(
      { error: 'Failed to create fault', details: error.message },
      { status: 500 }
    )
  }
} 