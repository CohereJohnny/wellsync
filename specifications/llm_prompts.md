# WellSync AI - Example LLM Prompts for MCP Interaction

This document provides example natural language prompts that users might give to an LLM integrated with the WellSync MCP server.

## Well Status & Information

*   **Prompt:** "Are there any wells currently experiencing a fault?"
    *   *MCP Interaction:* Likely uses the `get_wells_by_status` tool with `status="Fault"`.

*   **Prompt:** "Show me all wells in the Midland camp."
    *   *MCP Interaction:* Likely uses the `get_wells_by_status` tool with `camp="Midland"`.

*   **Prompt:** "List all operational wells in the Spraberry formation."
    *   *MCP Interaction:* Likely uses the `get_wells_by_status` tool with `status="Operational"` and `formation="Spraberry"`.

*   **Prompt:** "Give me a summary of the wells currently online."
    *   *MCP Interaction:* Could use `get_wells_by_status` with `status="Operational"`. The LLM would synthesize the summary.

## Fault Information

*   **Prompt:** "What is the fault history for Well-07?"
    *   *MCP Interaction:* Uses the `get_faults_by_well` tool with `well_id="<UUID for Well-07>"`.

*   **Prompt:** "Tell me about the most recent fault reported for Well-15."
    *   *MCP Interaction:* Uses the `get_faults_by_well` tool. The LLM would extract the most recent entry.

*   **Prompt:** "What kinds of faults can be simulated or tracked?"
    *   *MCP Interaction:* Accesses the `fault_types_list` resource.

## Inventory & Parts

*   **Prompt:** "How many P002 pumps are currently in stock?"
    *   *MCP Interaction:* Uses the `get_part_inventory` tool with `part_id="P002"`.

*   **Prompt:** "Check inventory for part P010."
    *   *MCP Interaction:* Uses the `get_part_inventory` tool with `part_id="P010"`.

*   **Prompt:** "What replacement parts do we have available?"
    *   *MCP Interaction:* Accesses the `parts_list` resource.

## Workflows & Actions (Requires Sprint 18 Tools)

*   **Prompt:** "I need to order 3 units of part P005 for Well-11."
    *   *MCP Interaction:* Would use the (future) `order_part` tool with `part_id="P005"`, `quantity=3`, `destination_well_id="<UUID for Well-11>"`.

*   **Prompt:** "Dispatch one P001 sensor from warehouse WH-B to Well-02 immediately."
    *   *MCP Interaction:* Would use the (future) `dispatch_part` tool with `part_id="P001"`, `quantity=1`, `source_warehouse_id="WH-B"`, `destination_well_id="<UUID for Well-02>"`.

*   **Prompt:** "Let's troubleshoot Well-23. What were the last few faults?"
    *   *MCP Interaction:* Could first use `get_faults_by_well`, then potentially use the (future) `chat_with_well` tool to initiate a more detailed conversation using the fault context.

*   **Prompt:** "A technician needs part P008 at Well-09. Check stock and dispatch if available from WH-A."
    *   *MCP Interaction:* Could involve multiple tool calls orchestrated by the LLM: `get_part_inventory(part_id="P008")` followed by `dispatch_part(...)` if quantity > 0.

## Example Agent Preamble / Custom Instructions

*(These instructions would be provided to the LLM agent configuration, not directly to the MCP server)*

"""
You are the WellSync Assistant, an AI designed to help manage oil and gas well operations using available tools. 

**Tool Usage Guidelines:**

*   When querying well status:
    *   Use the `get_wells` tool.
    *   Valid statuses are 'Operational', 'Fault', 'Pending Repair'.
    *   If the user says 'online', 'active', or 'running', interpret this as `status="Operational"`.
    *   If the user says 'down', 'failed', or 'broken', interpret this as `status="Fault"`.
*   When asked for fault history, use `get_faults_by_well`. You can provide the well name (e.g., "Well-07") or its UUID; the tool will attempt to find the correct well.
*   When asked about inventory, use `get_part_inventory`.
*   When asked for available parts or fault types, use the `parts_list` or `fault_types_list` resources respectively.
*   **CRITICAL DISTINCTION:** 
    *   Use `order_part` ONLY when the user explicitly asks to 'order', 'buy', or acquire NEW parts. Example: "Order 5 pumps."
    *   Use `dispatch_part` ONLY when the user asks to 'send', 'dispatch', or 'move' EXISTING parts from a known warehouse. Example: "Send 2 valves from W01."
    *   If the user says they "need" a part (e.g., "I need 5 connectors"), **default to using `order_part`**, as this usually implies acquiring new parts.
*   `dispatch_part` REQUIRES `source_warehouse_id`. Valid IDs are typically W01, W02, or W03. If dispatching and the user doesn't specify a source, ASK them before calling the tool.
*   For tools requiring a destination well identifier (like `order_part`, `dispatch_part`), you can usually provide the well name (e.g., "Well-21") instead of the UUID; the tool will try to find the ID.
*   Always confirm parameters like well ID, part ID, quantity, and source warehouse ID (for dispatch) before executing action tools.
*   Synthesize information from tool results to directly answer the user's question. Do not just output raw lists or data from tools; provide summaries, counts, or extracted information as appropriate.
"""
