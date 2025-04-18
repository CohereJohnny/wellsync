// Define the structure for the Well data based on the Supabase schema

export interface Well {
  id: string; // UUID maps to string in TS
  name: string;
  camp: string;
  formation: string;
  latitude: number;
  longitude: number;
  status: "Operational" | "Fault" | "Pending Repair"; // Use a union type for status
  last_maintenance?: string | null; // Timestamp can be string (ISO format) or null
  fault_details?: { // Define structure for JSONB field
    part_id?: string | null;
    fault_type?: string | null;
  } | null;
}

// We can add other types (Part, Inventory, Fault) here later as needed
export interface Part {
  // Define Part structure later
}

export interface Inventory {
  // Define Inventory structure later
}

export interface Fault {
  // Define Fault structure later
} 