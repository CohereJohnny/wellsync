# GridSync AI - Example LLM Prompts for MCP Interaction

This document provides example natural language prompts that users might give to an LLM integrated with the GridSync AI MCP server.

## Transformer Status & Information

*   **Prompt:** "Are there any transformers currently experiencing a fault?"
    *   *MCP Interaction:* Likely uses the `get_transformers` tool with `status="Fault"`.

*   **Prompt:** "Show me all transformers in the Heights substation."
    *   *MCP Interaction:* Likely uses the `get_transformers` tool with `substation="Heights"`.

*   **Prompt:** "List all operational distribution transformers in the Midtown area."
    *   *MCP Interaction:* Likely uses the `get_transformers` tool with `status="Operational"` and `type="Distribution"`.

*   **Prompt:** "Give me a summary of the transformers currently online."
    *   *MCP Interaction:* Could use `get_transformers` with `status="Operational"`. The LLM would synthesize the summary.

*   **Prompt:** "When was the last maintenance performed on transformer HTX-103?"
    *   *MCP Interaction:* Uses the `get_transformer` tool with `transformer_identifier="HTX-103"`. The response includes the last_maintenance_formatted field.

## Fault Information

*   **Prompt:** "What is the fault history for transformer HTX-101?"
    *   *MCP Interaction:* Uses the `get_faults_by_transformer` tool with `transformer_identifier="HTX-101"`. The result includes part specifications with serial numbers.

*   **Prompt:** "Tell me about the most recent fault reported for GTX-303, including the serial number of the affected part."
    *   *MCP Interaction:* Uses the `get_faults_by_transformer` tool. The LLM would extract the most recent entry and include the part serial number in the response.

*   **Prompt:** "What kinds of faults can occur in transformers?"
    *   *MCP Interaction:* Accesses the `transformer_fault_types_list` resource.

*   **Prompt:** "What's the current status and last maintenance date for transformer MTX-201?"
    *   *MCP Interaction:* Uses the `get_transformer` tool with `transformer_identifier="MTX-201"` to retrieve detailed transformer information.

## Inventory & Parts

*   **Prompt:** "How many XFMR-003 cooling fans are currently in stock?"
    *   *MCP Interaction:* Uses the `get_part_inventory` tool with `part_id="XFMR-003"`.

*   **Prompt:** "Check inventory for HV bushing parts."
    *   *MCP Interaction:* Uses the `get_part_inventory` tool with `part_id="XFMR-001"`.

*   **Prompt:** "What replacement components do we have available for transformers?"
    *   *MCP Interaction:* Accesses the `parts_list` resource.

## Workflows & Actions

*   **Prompt:** "I need to order 2 temperature gauges for transformer MTX-202."
    *   *MCP Interaction:* Would use the `order_part` tool with `part_id="XFMR-004"`, `quantity=2`, `transformer_id="<ID for MTX-202>"`. The response will indicate that the order has been triggered in SAP.

*   **Prompt:** "Dispatch 1 cooling fan from Warehouse A to transformer HTX-102."
    *   *MCP Interaction:* Would use the `dispatch_replacement` tool with `part_id="XFMR-003"`, `quantity=1`, `source_warehouse_id="A"`, `transformer_id="<ID for HTX-102>"`. The response will indicate that the dispatch has been triggered in SAP.

*   **Prompt:** "Simulate an oil leakage fault on transformer GTX-303."
    *   *MCP Interaction:* Would use the `trigger_transformer_fault` tool with `transformer_id="<ID for GTX-303>"`, `part_id="XFMR-007"`, `fault_type="Oil Leakage"`.

*   **Prompt:** "Let's troubleshoot MTX-201. What were the last few faults? Include the serial numbers of the affected parts."
    *   *MCP Interaction:* Would use `get_faults_by_transformer` with `transformer_identifier="MTX-201"` to retrieve fault history with part serial numbers.

*   **Prompt:** "A technician needs a cooling fan at transformer HTX-102. Check stock and order if available."
    *   *MCP Interaction:* Could involve multiple tool calls orchestrated by the LLM: `get_part_inventory(part_id="XFMR-003")` followed by either `order_part(...)` for a new part or `dispatch_replacement(...)` if the part is available in warehouse inventory. The response will indicate that the order/dispatch has been triggered in SAP.

## Example Agent Preamble / Custom Instructions

*(These instructions would be provided to the LLM agent configuration, not directly to the MCP server)*

"""
You are the GridSync AI Assistant, an AI designed to help manage electrical transformer operations using available tools. 

**Tool Usage Guidelines:**

*   When querying transformer status:
    *   Use the `get_transformers` tool for retrieving multiple transformers with filtering.
    *   Use the `get_transformer` tool for detailed information about a specific transformer, including its last maintenance date. This is the preferred tool when asked about a specific transformer's details, status, or maintenance history.
    *   Valid statuses are 'Operational', 'Fault', 'Pending Repair'.
    *   If the user says 'online', 'active', or 'running', interpret this as `status="Operational"`.
    *   If the user says 'down', 'failed', or 'broken', interpret this as `status="Fault"`.
*   When asked for fault history, use `get_faults_by_transformer`. You can provide the transformer name (e.g., "HTX-101") or its UUID; the tool will attempt to find the correct transformer.
    *   The tool returns part specifications with serial numbers. When reporting fault details, include the serial number of the affected part when available.
*   When asked about inventory, use `get_part_inventory`.
*   When asked for available parts or fault types, use the `parts_list` or `transformer_fault_types_list` resources respectively.
*   **Action Tools:** 
    *   Use `order_part` when the user asks to 'order', 'buy', or acquire NEW parts. Example: "Order 3 bushings for HTX-101."
    *   Use `dispatch_replacement` when the user asks to 'dispatch', 'send', or 'allocate' existing parts from warehouse inventory. Example: "Dispatch 1 cooling fan from Warehouse A to transformer HTX-102." This requires a `source_warehouse_id`.
    *   If the user says they "need" a part (e.g., "I need 2 cooling fans"), use `get_part_inventory` first, then either `dispatch_replacement` if inventory exists or `order_part` if not.
    *   When reporting on part orders or dispatches, always mention that the process has been "triggered in SAP" and include the SAP reference number.
*   For simulating faults on transformers, use the `trigger_transformer_fault` tool with the appropriate transformer ID, part ID, and fault type.
*   For tools requiring a transformer identifier (like `order_part`, `dispatch_replacement`, `get_faults_by_transformer`), you can usually provide the transformer name (e.g., "MTX-202") instead of the UUID; the tool will try to find the ID.
*   Always confirm parameters like transformer ID, part ID, quantity, and warehouse ID before executing action tools.
*   Synthesize information from tool results to directly answer the user's question. Do not just output raw lists or data from tools; provide summaries, counts, or extracted information as appropriate.
*   When discussing parts, include their serial numbers when available, especially when reporting faults.
"""
