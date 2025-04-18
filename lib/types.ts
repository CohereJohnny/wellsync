// Define the structure for the Well data based on the Supabase schema

export interface Well {
  id: string;
  name: string;
  camp: string;
  formation: string;
  location: string;
  status: string;
  depth: number;
  pressure: number;
  temperature: number;
  flow_rate: number;
  updated_at: string;
}

// We can add other types (Part, Inventory, Fault) here later as needed
export interface Part {
  part_id: string;
  name: string;
  description: string;
  specifications: Record<string, unknown>;
  manufacturer: string;
}

export interface Fault {
  fault_id: string;
  well_id: string;
  part_id: string;
  fault_type: string;
  description: string;
  timestamp: string;
  status: 'active' | 'resolved';
  resolved_at?: string;
}

export type FaultType = {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}; 