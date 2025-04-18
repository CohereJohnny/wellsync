// Define the structure for the Well data based on the Supabase schema

export type Well = {
  id: string;
  name: string;
  camp: string;
  formation: string;
  status: string;
  location: string;
  depth: number;
  pressure: number;
  temperature: number;
  flow_rate: number;
  updated_at: string;
  created_at: string;
};

// We can add other types (Part, Inventory, Fault) here later as needed
export type Part = {
  part_id: string;
  name: string;
  description: string;
  specifications: Record<string, any>;
  manufacturer: string;
};

export type Fault = {
  id: string;
  well_id: string;
  part_id: string;
  description: string;
  created_at: string;
  resolved_at?: string;
  status: 'active' | 'resolved';
};

export type FaultType = {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}; 