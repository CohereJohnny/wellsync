import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { wellId, partId, faultType } = await request.json()

    // Start a Supabase transaction
    const { data: fault, error: faultError } = await supabase
      .from('faults')
      .insert([
        {
          well_id: wellId,
          part_id: partId,
          fault_type: faultType,
          description: `${faultType} fault detected`, // Add a basic description
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (faultError) {
      throw faultError
    }

    // Update well status and fault details
    const { error: wellError } = await supabase
      .from('wells')
      .update({ 
        status: 'Fault',
        fault_details: {
          part_id: partId,
          fault_type: faultType
        }
      })
      .eq('id', wellId)

    if (wellError) {
      throw wellError
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