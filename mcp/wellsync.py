import os
from dotenv import load_dotenv
from typing import Any
from custom_mcp_tools.auth_utils import AuthorizedMCP
from supabase import create_client, Client, ClientOptions
from loguru import logger
import uuid # Import uuid library
import httpx # Import httpx
from datetime import datetime

# --- Load Environment Variables ---
load_dotenv() # Load variables from .env file in the current directory (mcp/)

# --- Configuration ---
MCP_NAME = "gridsync"
MCP_PORT = 3003  # Different port than og_demo
AUTH_SECRET = os.getenv("AUTH_SECRET", "centerpoint-gridsync-demo") # Default if not in .env
NEXTJS_APP_URL = os.getenv("NEXTJS_APP_URL", "http://localhost:3000") # URL of the running Next.js app

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in the .env file")

# Initialize Supabase client
supabase: Client = create_client(
    SUPABASE_URL, 
    SUPABASE_KEY,
    options=ClientOptions(
        headers={ "Accept": "application/json" } 
    )
)

# --- Basic Validation ---
try:
    # Try a simple query to validate connection and credentials
    supabase.table('transformers').select('id', head=True).limit(1).execute()
    print("Supabase connection successful!")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    # Optionally raise the error or exit if connection is critical for startup
    # raise e 

# Initialize MCP server
mcp = AuthorizedMCP(
    MCP_NAME,
    debug=True,
    port=MCP_PORT,
    auth_secret=AUTH_SECRET
)

# --- Query Tools ---

@mcp.tool(
    name="get_transformers",
    description="Retrieves transformers from the database, optionally filtering by status, substation, and type.",
)
def get_transformers(
    status: str = None,
    substation: str = None,
    type: str = None
) -> dict[str, Any]:
    """
    Retrieves transformers from the database that match the specified filter criteria.
    """

    logger.info(f"Getting transformers request with status: {status}, substation: {substation}, type: {type}")

    query = supabase.table('transformers').select('*').order('name')
    
    applied_filters = {}
    # Apply filters if provided and not 'all' (case-insensitive)
    if status and status.lower() != 'all':
        db_status = status
        if status.lower() == 'online':
            db_status = 'Operational'
            
        # Capitalize status to match expected DB values
        formatted_status = db_status.capitalize()
        query = query.eq('status', formatted_status)
        applied_filters['status'] = formatted_status
        
    if substation and substation.lower() != 'all':
        # Assuming substation names are stored capitalized in DB
        formatted_substation = substation.capitalize()
        query = query.eq('substation', formatted_substation)
        applied_filters['substation'] = formatted_substation
        
    if type and type.lower() != 'all':
        # Handle potential multi-word types
        formatted_type = ' '.join(word.capitalize() for word in type.split())
        query = query.eq('type', formatted_type)
        applied_filters['type'] = formatted_type
    
    logger.info(f"Executing query for filters: {applied_filters}")

    try:
        response = query.execute()
        logger.info(f"Response data count: {len(response.data) if response.data else 0}")
        return {
            "status": "success",
            "data": response.data,
            "count": len(response.data),
            "filters": applied_filters
        }
    except Exception as e:
        logger.error(f"Error executing query: {e}")
        return {
            "status": "error",
            "message": str(e),
            "filters": applied_filters
        }

@mcp.tool(
    name="get_transformer",
    description="Retrieves detailed information about a specific transformer, accepting either the transformer's name or its UUID.",
)
def get_transformer(transformer_identifier: str) -> dict[str, Any]:
    """
    Retrieves detailed information for a specific transformer.
    Accepts either transformer name or transformer UUID as input.
    """
    logger.info(f"Getting details for transformer: {transformer_identifier}")
    
    try:
        # Check if the identifier is a UUID
        try:
            uuid.UUID(transformer_identifier)
            transformer_id = transformer_identifier
            query = supabase.table('transformers') \
                          .select('*') \
                          .eq('id', transformer_id) \
                          .single()
        except ValueError:
            # Not a UUID, assume it's a name
            query = supabase.table('transformers') \
                          .select('*') \
                          .eq('name', transformer_identifier) \
                          .single()
        
        response = query.execute()
        
        if not response.data:
            logger.warning(f"Transformer not found with identifier: {transformer_identifier}")
            return {
                "status": "error",
                "message": f"Could not find a transformer with the identifier '{transformer_identifier}'.",
                "transformer_identifier": transformer_identifier
            }
            
        transformer_data = response.data
        
        # Convert last_maintenance timestamp to a more readable format if it exists
        if transformer_data.get('last_maintenance'):
            try:
                # Parse the timestamp and format it
                maintenance_date = datetime.fromisoformat(transformer_data['last_maintenance'].replace('Z', '+00:00'))
                transformer_data['last_maintenance_formatted'] = maintenance_date.strftime("%B %d, %Y")
            except (ValueError, TypeError) as e:
                logger.warning(f"Error formatting last_maintenance date: {e}")
                transformer_data['last_maintenance_formatted'] = transformer_data['last_maintenance']
                
        # If the transformer has a fault, fetch part details including serial number
        if transformer_data.get('fault_details') and transformer_data['fault_details'].get('part_id'):
            part_id = transformer_data['fault_details']['part_id']
            part_query = supabase.table('parts') \
                               .select('specifications') \
                               .eq('part_id', part_id) \
                               .single()
            part_response = part_query.execute()
            
            if part_response.data and part_response.data.get('specifications'):
                transformer_data['fault_details']['part_specifications'] = part_response.data.get('specifications')
        
        return {
            "status": "success",
            "data": transformer_data
        }
        
    except Exception as e:
        logger.error(f"Error retrieving transformer details: {e}")
        return {
            "status": "error",
            "message": f"Error retrieving transformer details: {e}",
            "transformer_identifier": transformer_identifier
        }

@mcp.tool(
    name="get_faults_by_transformer",
    description="Retrieves the fault history for a specific transformer, accepting either the transformer's name or its UUID.",
)
def get_faults_by_transformer(transformer_identifier: str) -> dict[str, Any]:
    """
    Retrieves fault history for a specific transformer, sorted by timestamp descending.
    Accepts either transformer name or transformer UUID as input.
    """
    actual_transformer_id = None
    
    try:
        uuid.UUID(transformer_identifier)
        actual_transformer_id = transformer_identifier
        logger.info(f"Input '{transformer_identifier}' identified as UUID.")
    except ValueError:
        logger.info(f"Input '{transformer_identifier}' is not a UUID, assuming it's a name. Looking up ID...")
        try:
            lookup_query = supabase.table('transformers') \
                                 .select('id') \
                                 .eq('name', transformer_identifier) \
                                 .single()
            lookup_response = lookup_query.execute()
            
            if lookup_response.data and lookup_response.data.get('id'):
                actual_transformer_id = lookup_response.data['id']
                logger.info(f"Found ID '{actual_transformer_id}' for name '{transformer_identifier}'.")
            else:
                logger.warning(f"Could not find ID for transformer name '{transformer_identifier}'.")
                return {
                    "status": "error",
                    "message": f"Could not find a transformer with the name '{transformer_identifier}'.",
                    "transformer_identifier": transformer_identifier
                }
        except Exception as lookup_e:
            logger.error(f"Error looking up transformer ID for name '{transformer_identifier}': {lookup_e}")
            return {
                "status": "error",
                "message": f"Error looking up ID for transformer name '{transformer_identifier}': {lookup_e}",
                "transformer_identifier": transformer_identifier
            }

    if actual_transformer_id:
        try:
            logger.info(f"Querying faults for transformer ID: {actual_transformer_id}")
            query = supabase.table('faults') \
                          .select('*') \
                          .eq('transformer_id', actual_transformer_id) \
                          .order('timestamp', desc=True)
            
            response = query.execute()
            
            # Fetch part details including serial numbers for each fault
            enriched_faults = []
            for fault in response.data:
                part_id = fault.get('part_id')
                if part_id:
                    # Get part details including specifications with serial number
                    part_query = supabase.table('parts') \
                                       .select('specifications') \
                                       .eq('part_id', part_id) \
                                       .single()
                    part_response = part_query.execute()
                    
                    if part_response.data and part_response.data.get('specifications'):
                        # Add part specifications to fault data
                        fault['part_specifications'] = part_response.data.get('specifications')
                        
                        # Extract serial number for easy access
                        serial_number = part_response.data.get('specifications', {}).get('serial_number')
                        if serial_number:
                            fault['part_serial_number'] = serial_number
                
                enriched_faults.append(fault)
            
            return {
                "status": "success",
                "data": enriched_faults,
                "count": len(enriched_faults),
                "transformer_id_used": actual_transformer_id
            }
        except Exception as e:
            logger.error(f"Error querying faults for transformer ID '{actual_transformer_id}': {e}")
            return {
                "status": "error",
                "message": f"Error fetching faults: {e}",
                "transformer_id_used": actual_transformer_id
            }
    else:
        logger.error(f"Failed to determine a valid transformer ID from identifier '{transformer_identifier}'.")
        return {
            "status": "error", 
            "message": "Could not determine a valid transformer ID from the provided identifier.",
            "transformer_identifier": transformer_identifier
        }

@mcp.tool(
    name="get_part_inventory",
    description="Retrieves the current inventory breakdown by warehouse for a specific part ID (e.g., XFMR-001).",
)
def get_part_inventory(part_id: str) -> dict[str, Any]:
    """
    Retrieves the current inventory count for a specific part ID, broken down by warehouse.
    """
    logger.info(f"Getting inventory breakdown for part ID: {part_id}")
    
    try:
        inventory_query = supabase.table('inventory').select('warehouse_id, stock_level').eq('part_id', part_id)
        inventory_response = inventory_query.execute()
        
        inventory_breakdown = []
        total_quantity = 0
        
        if inventory_response.data:
            for item in inventory_response.data:
                warehouse_id = item.get('warehouse_id')
                quantity = item.get('stock_level', 0)
                if warehouse_id is not None:
                    inventory_breakdown.append({"warehouse_id": warehouse_id, "quantity": quantity})
                    total_quantity += quantity
            
            logger.info(f"Found total quantity {total_quantity} for part {part_id} across {len(inventory_breakdown)} warehouses.")
            return {
                "status": "success",
                "part_id": part_id,
                "total_quantity": total_quantity,
                "inventory_by_warehouse": inventory_breakdown
            }
        else:
            logger.info(f"Part {part_id} not found in inventory table, assuming total quantity 0.")
            return {
                "status": "success",
                "part_id": part_id,
                "total_quantity": 0,
                "inventory_by_warehouse": [],
                "message": f"Part ID {part_id} has no inventory record."
            }
            
    except Exception as e:
        logger.error(f"Error querying inventory for part {part_id}: {e}")
        return {
            "status": "error",
            "message": f"Error retrieving inventory count: {e}",
            "part_id": part_id
        }

# --- Workflow Tools (API Calls) ---

@mcp.tool(
    name="trigger_transformer_fault",
    description="Simulates a fault for a specific transformer, useful for testing the fault monitoring system.",
)
async def trigger_transformer_fault(transformer_id: str, part_id: str, fault_type: str, description: str = None) -> dict[str, Any]:
    """
    Sends a request to the /api/faults endpoint to simulate a fault for a transformer.
    """
    logger.info(f"Simulating fault for transformer {transformer_id}, part {part_id}, type {fault_type}")
    
    api_endpoint = f"{NEXTJS_APP_URL}/api/faults"
    
    payload = {
        "transformerId": transformer_id,
        "partId": part_id,
        "faultType": fault_type,
        "description": description or f"{fault_type} fault detected on part {part_id}"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_endpoint, json=payload)
            response.raise_for_status()
            api_response_data = response.json()
            logger.info(f"Received response from {api_endpoint}: {api_response_data}")
            return {
                "status": "success",
                "fault_details": api_response_data,
                "message": "Fault successfully triggered"
            }
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error calling {api_endpoint}: {e.response.status_code} - {e.response.text}")
        return {
            "status": "error",
            "message": f"Fault API request failed: {e.response.status_code}",
            "details": e.response.text
        }
    except Exception as e:
        logger.error(f"Unexpected error in trigger_transformer_fault: {e}")
        return {
            "status": "error",
            "message": f"An unexpected error occurred: {e}"
        }

@mcp.tool(
    name="order_part",
    description="Places an order for a specific quantity of a NEW part to be delivered to a transformer.",
)
async def order_part(part_id: str, quantity: int, transformer_id: str) -> dict[str, Any]:
    """
    Sends a request to the /api/orders endpoint to simulate ordering a part.
    """
    logger.info(f"Initiating order for part {part_id} (Qty: {quantity}) for transformer {transformer_id}")

    api_endpoint = f"{NEXTJS_APP_URL}/api/orders"
    
    payload = {
        "part_id": part_id,
        "quantity": quantity,
        "destination_transformer_id": transformer_id
    }
    
    try:
        # Get part details including serial number if available
        part_query = supabase.table('parts') \
                           .select('name, specifications') \
                           .eq('part_id', part_id) \
                           .single()
        part_response = part_query.execute()
        
        part_name = part_id
        part_serial = None
        if part_response.data:
            part_name = part_response.data.get('name', part_id)
            if part_response.data.get('specifications', {}).get('serial_number'):
                part_serial = part_response.data.get('specifications', {}).get('serial_number')
        
        async with httpx.AsyncClient() as client:
            response = await client.post(api_endpoint, json=payload)
            response.raise_for_status() 
            api_response_data = response.json()
            logger.info(f"Received response from {api_endpoint}: {api_response_data}")
            
            # Create a more detailed order confirmation message
            order_confirmation = f"Order for {quantity} x {part_name}"
            if part_serial:
                order_confirmation += f" (Serial: {part_serial})"
            order_confirmation += f" has been triggered in SAP for transformer {transformer_id}"
            
            return {
                "status": "success",
                "order_confirmation": order_confirmation,
                "sap_reference": f"SAP-{uuid.uuid4().hex[:8].upper()}",
                "details": payload,
                "message": "Part order has been triggered in SAP"
            }
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error calling {api_endpoint}: {e.response.status_code} - {e.response.text}")
        return {
            "status": "error",
            "message": f"Order API request failed: {e.response.status_code}",
            "details": e.response.text
        }
    except Exception as e:
        logger.error(f"Unexpected error in order_part: {e}")
        return {
            "status": "error",
            "message": f"An unexpected error occurred: {e}"
        }

@mcp.tool(
    name="dispatch_replacement",
    description="Dispatches existing parts from a warehouse to a transformer for replacement, reducing inventory.",
)
async def dispatch_replacement(part_id: str, quantity: int, source_warehouse_id: str, transformer_id: str) -> dict[str, Any]:
    """
    Sends a request to the /api/dispatches endpoint to simulate dispatching a part from warehouse inventory.
    """
    logger.info(f"Initiating dispatch for part {part_id} (Qty: {quantity}) from warehouse {source_warehouse_id} to transformer {transformer_id}")

    api_endpoint = f"{NEXTJS_APP_URL}/api/dispatches"
    
    payload = {
        "part_id": part_id,
        "quantity": quantity,
        "source_warehouse_id": source_warehouse_id,
        "destination_transformer_id": transformer_id
    }
    
    try:
        # Get part details including serial number if available
        part_query = supabase.table('parts') \
                           .select('name, specifications') \
                           .eq('part_id', part_id) \
                           .single()
        part_response = part_query.execute()
        
        part_name = part_id
        part_serial = None
        if part_response.data:
            part_name = part_response.data.get('name', part_id)
            if part_response.data.get('specifications', {}).get('serial_number'):
                part_serial = part_response.data.get('specifications', {}).get('serial_number')
        
        async with httpx.AsyncClient() as client:
            response = await client.post(api_endpoint, json=payload)
            response.raise_for_status() 
            api_response_data = response.json()
            logger.info(f"Received response from {api_endpoint}: {api_response_data}")
            
            # Create a more detailed dispatch confirmation message
            dispatch_confirmation = f"Dispatch of {quantity} x {part_name}"
            if part_serial:
                dispatch_confirmation += f" (Serial: {part_serial})"
            dispatch_confirmation += f" has been triggered in SAP from warehouse {source_warehouse_id} to transformer {transformer_id}"
            
            return {
                "status": "success",
                "dispatch_confirmation": dispatch_confirmation,
                "sap_reference": f"SAP-{uuid.uuid4().hex[:8].upper()}",
                "details": payload,
                "message": "Part dispatch has been triggered in SAP"
            }
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error calling {api_endpoint}: {e.response.status_code} - {e.response.text}")
        return {
            "status": "error",
            "message": f"Dispatch API request failed: {e.response.status_code}",
            "details": e.response.text
        }
    except Exception as e:
        logger.error(f"Unexpected error in dispatch_replacement: {e}")
        return {
            "status": "error",
            "message": f"An unexpected error occurred: {e}"
        }

# --- Resources ---

# In-memory cache for parts list
parts_cache = None

@mcp.resource(
    uri="wellsync://parts",
    name="parts_list",
    description="Provides a list of all available parts."
)
def list_parts() -> dict[str, Any]:
    """
    Retrieves the list of all parts from the database, using a simple cache.
    """
    global parts_cache
    if parts_cache is not None:
        return {"status": "success", "data": parts_cache, "source": "cache"}
        
    try:
        query = supabase.table('parts').select('*').order('name')
        response = query.execute()
        parts_cache = response.data
        return {
            "status": "success",
            "data": parts_cache,
            "count": len(parts_cache),
            "source": "database"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@mcp.resource(
    uri="wellsync://transformers",
    name="transformers_list",
    description="Provides a list of all transformers."
)
def list_transformers() -> dict[str, Any]:
    """
    Retrieves the list of all transformers from the database.
    """
    try:
        query = supabase.table('transformers').select('*').order('name')
        response = query.execute()
        return {
            "status": "success",
            "data": response.data,
            "count": len(response.data)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# Transformer-specific fault types
TRANSFORMER_FAULT_TYPES = [
  { "name": 'Insulation Deterioration', "severity": 'critical' },
  { "name": 'Winding Failure', "severity": 'critical' },
  { "name": 'Oil Leakage', "severity": 'high' },
  { "name": 'Overheating', "severity": 'high' },
  { "name": 'Bushing Failure', "severity": 'high' },
  { "name": 'Core Saturation', "severity": 'medium' },
  { "name": 'Cooling System Malfunction', "severity": 'medium' },
  { "name": 'Tap Changer Misoperation', "severity": 'medium' },
  { "name": 'Voltage Fluctuation', "severity": 'medium' },
  { "name": 'Partial Discharge', "severity": 'high' },
  { "name": 'Moisture Ingress', "severity": 'medium' },
  { "name": 'Protection System Failure', "severity": 'critical' },
  { "name": 'Phase Imbalance', "severity": 'high' },
  { "name": 'Harmonic Overload', "severity": 'medium' },
  { "name": 'Abnormal Vibration', "severity": 'low' },
  { "name": 'Ground Fault', "severity": 'critical' },
  { "name": 'Lightning Strike Damage', "severity": 'high' },
  { "name": 'Loose Connection', "severity": 'medium' },
]

@mcp.resource(
    uri="wellsync://transformer_fault_types",
    name="transformer_fault_types_list",
    description="Provides a predefined list of possible transformer fault types and their severity."
)
def list_transformer_fault_types() -> dict[str, Any]:
    """
    Returns a hardcoded list of transformer fault types.
    """
    return {
        "status": "success",
        "data": TRANSFORMER_FAULT_TYPES,
        "count": len(TRANSFORMER_FAULT_TYPES)
    }

# --- Run Server ---
if __name__ == "__main__":
    print(f"Starting {MCP_NAME} MCP server on port {MCP_PORT}...")
    mcp.run(transport="sse") 