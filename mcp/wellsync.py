import os
from dotenv import load_dotenv
from typing import Any
from custom_mcp_tools.auth_utils import AuthorizedMCP
from supabase import create_client, Client, ClientOptions
from loguru import logger
import uuid # Import uuid library
import httpx # Import httpx

# --- Load Environment Variables ---
load_dotenv() # Load variables from .env file in the current directory (mcp/)

# --- Configuration ---
MCP_NAME = "wellsync"
MCP_PORT = 3003  # Different port than og_demo
AUTH_SECRET = os.getenv("AUTH_SECRET", "wellsync-secret") # Default if not in .env
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
    supabase.table('wells').select('id', head=True).limit(1).execute()
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
    name="get_wells",
    description="Retrieves wells from the database, optionally filtering by status, camp, and formation.",
)
def get_wells(
    status: str = None,
    camp: str = None,
    formation: str = None
) -> dict[str, Any]:
    """
    Retrieves wells from the database that match the specified filter criteria.
    """

    logger.info(f"Getting wells request with status: {status}, camp: {camp}, formation: {formation}")

    query = supabase.table('wells').select('*').order('name') # Default sort by name
    
    applied_filters = {}
    # Apply filters if provided and not 'all' (case-insensitive)
    if status and status.lower() != 'all':
        db_status = status # Default to using the provided status
        # Handle synonyms
        if status.lower() == 'online':
            db_status = 'Operational'
            
        # Capitalize status to match expected DB values (e.g., 'fault' -> 'Fault')
        formatted_status = db_status.capitalize()
        query = query.eq('status', formatted_status)
        applied_filters['status'] = formatted_status
        
    if camp and camp.lower() != 'all':
        # Assuming camp names are stored capitalized in DB
        formatted_camp = camp.capitalize()
        query = query.eq('camp', formatted_camp)
        applied_filters['camp'] = formatted_camp
        
    if formation and formation.lower() != 'all':
        # Handle potential multi-word formations (e.g., "bone spring" -> "Bone Spring")
        formatted_formation = ' '.join(word.capitalize() for word in formation.split())
        query = query.eq('formation', formatted_formation)
        applied_filters['formation'] = formatted_formation
    
    logger.info(f"Executing query for filters: {applied_filters}")

    try:
        response = query.execute()
        logger.info(f"Response: {response}")
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
    name="get_faults_by_well",
    description="Retrieves the fault history for a specific well, accepting either the well's name or its UUID.", # Updated description
)
def get_faults_by_well(well_identifier: str) -> dict[str, Any]: # Renamed parameter for clarity
    """
    Retrieves fault history for a specific well, sorted by timestamp descending.
    Accepts either well name or well UUID as input.
    """
    actual_well_id = None
    
    # 1. Try to parse as UUID
    try:
        uuid.UUID(well_identifier)
        actual_well_id = well_identifier # Input is likely a valid UUID
        logger.info(f"Input '{well_identifier}' identified as UUID.")
    except ValueError:
        logger.info(f"Input '{well_identifier}' is not a UUID, assuming it's a name. Looking up ID...")
        # 2. If not a UUID, assume it's a name and look up the ID
        try:
            lookup_query = supabase.table('wells') \
                                 .select('id') \
                                 .eq('name', well_identifier) \
                                 .single()
            lookup_response = lookup_query.execute()
            
            if lookup_response.data and lookup_response.data.get('id'):
                actual_well_id = lookup_response.data['id']
                logger.info(f"Found ID '{actual_well_id}' for name '{well_identifier}'.")
            else:
                logger.warning(f"Could not find ID for well name '{well_identifier}'.")
                return {
                    "status": "error",
                    "message": f"Could not find a well with the name '{well_identifier}'.",
                    "well_identifier": well_identifier
                }
        except Exception as lookup_e:
            logger.error(f"Error looking up well ID for name '{well_identifier}': {lookup_e}")
            return {
                "status": "error",
                "message": f"Error looking up ID for well name '{well_identifier}': {lookup_e}",
                "well_identifier": well_identifier
            }

    # 3. If we have an ID (either original or looked up), query faults
    if actual_well_id:
        try:
            logger.info(f"Querying faults for well ID: {actual_well_id}")
            query = supabase.table('faults') \
                          .select('*') \
                          .eq('well_id', actual_well_id) \
                          .order('timestamp', desc=True)
            
            response = query.execute()
            return {
                "status": "success",
                "data": response.data,
                "count": len(response.data),
                "well_id_used": actual_well_id # Clarify which ID was used
            }
        except Exception as e:
            logger.error(f"Error querying faults for well ID '{actual_well_id}': {e}")
            return {
                "status": "error",
                "message": f"Error fetching faults: {e}",
                "well_id_used": actual_well_id
            }
    else:
        # This case should technically not be reached if name lookup error handling is correct
        # but added as a fallback.
        logger.error(f"Failed to determine a valid well ID from identifier '{well_identifier}'.")
        return {
            "status": "error", 
            "message": "Could not determine a valid well ID from the provided identifier.",
            "well_identifier": well_identifier
        }

@mcp.tool(
    name="get_part_inventory",
    description="Retrieves the current inventory breakdown by warehouse for a specific part ID (e.g., P001).",
)
def get_part_inventory(part_id: str) -> dict[str, Any]:
    """
    Retrieves the current inventory count for a specific part ID, broken down by warehouse.
    """
    logger.info(f"Getting inventory breakdown for part ID: {part_id}")
    
    try:
        # Select warehouse_id and stock_level
        inventory_query = supabase.table('inventory').select('warehouse_id, stock_level').eq('part_id', part_id)
        
        inventory_response = inventory_query.execute()
        
        inventory_breakdown = []
        total_quantity = 0
        
        if inventory_response.data:
            # Iterate through results to build breakdown and calculate total
            for item in inventory_response.data:
                warehouse_id = item.get('warehouse_id')
                quantity = item.get('stock_level', 0)
                if warehouse_id is not None: # Basic check
                    inventory_breakdown.append({"warehouse_id": warehouse_id, "quantity": quantity})
                    total_quantity += quantity
            
            logger.info(f"Found total quantity {total_quantity} for part {part_id} across {len(inventory_breakdown)} warehouses.")
            return {
                "status": "success",
                "part_id": part_id,
                "total_quantity": total_quantity,
                "inventory_by_warehouse": inventory_breakdown # Return the detailed breakdown
            }
        else:
            # Handle case where part is not found in the inventory table at all
            logger.info(f"Part {part_id} not found in inventory table, assuming total quantity 0.")
            return {
                "status": "success",
                "part_id": part_id,
                "total_quantity": 0,
                "inventory_by_warehouse": [], # Empty list for breakdown
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

NEXTJS_APP_URL = os.getenv("NEXTJS_APP_URL", "http://localhost:3000") # URL of the running Next.js app

@mcp.tool(
    name="order_part",
    description="Places an order for a specific quantity of a NEW part to be delivered to a well. Use this when acquiring new parts, not for sending existing stock. Accepts well name or UUID."
)
async def order_part(part_id: str, quantity: int, destination_well_id: str) -> dict[str, Any]: # Reverted param name
    """
    Sends a request to the /api/orders endpoint to simulate ordering a part.
    Accepts well name or UUID for destination_well_id.
    """
    logger.info(f"Initiating order for part {part_id} (Qty: {quantity}) for well identifier {destination_well_id}")

    # --- Resolve Well ID ---
    actual_well_id = None
    try:
        uuid.UUID(destination_well_id)
        actual_well_id = destination_well_id
        logger.info(f"Destination identifier '{destination_well_id}' identified as UUID.")
    except ValueError:
        logger.info(f"Destination identifier '{destination_well_id}' is not UUID, looking up ID by name...")
        try:
            lookup_query = supabase.table('wells').select('id').eq('name', destination_well_id).single()
            lookup_response = lookup_query.execute()
            if lookup_response.data and lookup_response.data.get('id'):
                actual_well_id = lookup_response.data['id']
                logger.info(f"Found destination ID '{actual_well_id}' for name '{destination_well_id}'.")
            else:
                logger.warning(f"Could not find ID for destination well name '{destination_well_id}'.")
                return {"status": "error", "message": f"Could not find destination well named '{destination_well_id}'."}
        except Exception as lookup_e:
            logger.error(f"Error looking up destination well ID for '{destination_well_id}': {lookup_e}")
            return {"status": "error", "message": f"Error looking up destination well ID: {lookup_e}"}

    if not actual_well_id:
         # Fallback error - should be caught above
         return {"status": "error", "message": "Failed to resolve destination well ID."}
    # --- End Resolve Well ID ---

    api_endpoint = f"{NEXTJS_APP_URL}/api/orders"
    
    payload = {
        "part_id": part_id,
        "quantity": quantity,
        "destination_well_id": actual_well_id # Use resolved ID
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_endpoint, json=payload)
            response.raise_for_status() 
            api_response_data = response.json()
            logger.info(f"Received response from {api_endpoint}: {api_response_data}")
            return {
                "status": "success",
                "order_confirmation": api_response_data.get("message", "Order processed."),
                "details": payload # Echo back the request details
            }
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error calling {api_endpoint}: {e.response.status_code} - {e.response.text}")
        error_details = e.response.json() if e.response.headers.get('content-type') == 'application/json' else e.response.text
        return {
            "status": "error",
            "message": f"Order API request failed: {e.response.status_code}",
            "details": error_details
        }
    except httpx.RequestError as e:
        logger.error(f"Request error calling {api_endpoint}: {e}")
        return {
            "status": "error",
            "message": f"Could not connect to the order API: {e}"
        }
    except Exception as e:
        logger.error(f"Unexpected error in order_part: {e}")
        return {
            "status": "error",
            "message": f"An unexpected error occurred: {e}"
        }
        
@mcp.tool(
    name="dispatch_part",
    description="Dispatches a quantity of an EXISTING part from a specified warehouse to a well. Requires knowing the source warehouse ID (e.g., W01, W02, W03). Accepts well name or UUID for destination."
)
async def dispatch_part(part_id: str, quantity: int, source_warehouse_id: str, destination_well_id: str) -> dict[str, Any]: # Reverted param name
    """
    Sends a request to the /api/dispatches endpoint to simulate dispatching a part.
    Accepts well name or UUID for destination_well_id.
    """
    logger.info(f"Initiating dispatch for part {part_id} (Qty: {quantity}) from {source_warehouse_id} to well identifier {destination_well_id}") # Log uses old name now
    
    # --- Resolve Well ID ---
    actual_well_id = None
    try:
        uuid.UUID(destination_well_id) # Check the incoming param
        actual_well_id = destination_well_id
        logger.info(f"Destination identifier '{destination_well_id}' identified as UUID.")
    except ValueError:
        logger.info(f"Destination identifier '{destination_well_id}' is not UUID, looking up ID by name...")
        try:
            lookup_query = supabase.table('wells').select('id').eq('name', destination_well_id).single() # Use incoming param for lookup
            lookup_response = lookup_query.execute()
            if lookup_response.data and lookup_response.data.get('id'):
                actual_well_id = lookup_response.data['id']
                logger.info(f"Found destination ID '{actual_well_id}' for name '{destination_well_id}'.")
            else:
                logger.warning(f"Could not find ID for destination well name '{destination_well_id}'.")
                return {"status": "error", "message": f"Could not find destination well named '{destination_well_id}'."}
        except Exception as lookup_e:
            # Enhanced logging for lookup error
            logger.exception(f"Exception occurred during Supabase lookup for well name '{destination_well_id}'.")
            return {"status": "error", "message": f"Error looking up destination well ID: {lookup_e}"}
    
    if not actual_well_id:
         # Fallback error - should be caught above
         logger.error(f"Failed to resolve a valid destination well ID for identifier: {destination_well_id}") # Log failure
         return {"status": "error", "message": "Failed to resolve destination well ID."}
    # --- End Resolve Well ID ---

    api_endpoint = f"{NEXTJS_APP_URL}/api/dispatches"
    
    payload = {
        "part_id": part_id,
        "quantity": quantity,
        "source_warehouse_id": source_warehouse_id,
        "destination_well_id": actual_well_id # Use resolved ID (name matches API endpoint expectation)
    }
    
    logger.info(f"Attempting to POST to {api_endpoint} with payload: {payload}") # Log payload before sending
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_endpoint, json=payload)
            response.raise_for_status() # Will raise error for 4xx (e.g., insufficient stock) or 5xx
            api_response_data = response.json()
            logger.info(f"Received successful response from {api_endpoint}: {api_response_data}")
            # Assuming success means dispatch happened
            return {
                "status": "success",
                "dispatch_confirmation": api_response_data.get("message", "Dispatch processed successfully."),
                "details": payload
            }
    except httpx.HTTPStatusError as e:
        # Enhanced logging for HTTP status errors
        logger.exception(f"HTTP Status Error calling {api_endpoint}. Status: {e.response.status_code}. Response: {e.response.text}")
        # Try to parse error details, provide specific message for common cases like 400
        error_details = { "raw": e.response.text }
        try:
            error_json = e.response.json()
            error_details = error_json # Replace raw text if JSON parsing works
        except Exception as json_e:
            logger.warning(f"Could not parse error response as JSON: {json_e}") # Log JSON parsing failure
            pass # Keep raw text if JSON parsing fails
        
        error_message = f"Dispatch API request failed: {e.response.status_code}"
        if e.response.status_code == 400 and isinstance(error_details, dict) and "error" in error_details:
             error_message = f"Dispatch failed: {error_details['error']}" # Use specific error from API if available
        elif e.response.status_code == 400: 
            error_message = "Dispatch failed (Bad Request - likely insufficient stock or invalid input)."

        return {
            "status": "error",
            "message": error_message,
            "details": error_details
        }
    except httpx.RequestError as e:
        # Enhanced logging for request errors (network issues, DNS, etc.)
        logger.exception(f"HTTP Request Error calling {api_endpoint}. Error: {e}")
        return {
            "status": "error",
            "message": f"Could not connect to the dispatch API: {e}"
        }
    except Exception as e:
        # Enhanced logging for any other unexpected errors
        logger.exception(f"Unexpected error occurred in dispatch_part tool.")
        return {
            "status": "error",
            "message": f"An unexpected error occurred: {e}"
        }

# --- Resources ---

# In-memory cache for parts list
parts_cache = None

@mcp.resource(
    uri="wellsync://parts",
    name="parts_list", # Using snake_case for resource name
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
        parts_cache = response.data # Cache the result
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

# Predefined fault types (consistent with frontend)
FAULT_TYPES_LIST = [
  { "name": 'Pressure Loss', "severity": 'high' },
  { "name": 'Temperature Spike', "severity": 'critical' },
  { "name": 'Flow Rate Drop', "severity": 'medium' },
  { "name": 'Vibration', "severity": 'low' },
  { "name": 'Power Failure', "severity": 'critical' },
  { "name": 'Communication Loss', "severity": 'high' },
]

@mcp.resource(
    uri="wellsync://fault_types",
    name="fault_types_list",
    description="Provides a predefined list of possible fault types and their severity."
)
def list_fault_types() -> dict[str, Any]:
    """
    Returns a hardcoded list of fault types.
    """
    return {
        "status": "success",
        "data": FAULT_TYPES_LIST,
        "count": len(FAULT_TYPES_LIST)
    }

# --- Run Server ---
if __name__ == "__main__":
    print(f"Starting {MCP_NAME} MCP server on port {MCP_PORT}...")
    mcp.run(transport="sse") 