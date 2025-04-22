# Sprint 18 Tasks: MCP Server - Workflow Tools via API Integration

## Goal
Implement MCP tools that interact with the existing Next.js API endpoints for chat and workflows.

## Tasks

- [x] Implement `order_part` tool (calls `/api/orders`).
- [x] Implement `dispatch_part` tool (calls `/api/dispatches`).
- [x] Handle authentication/secrets if needed for API calls (assess if current MCP auth is sufficient).
- [x] Ensure proper error handling and result formatting for API calls.

## Sprint Review
- **Demo Readiness**: Workflow tools (`order_part`, `dispatch_part`) are implemented on the MCP server and successfully call the respective Next.js API endpoints. Error handling and result formatting are in place. Name/UUID resolution works for destination wells in both tools. `get_part_inventory` now shows breakdown by warehouse. Testing confirms successful ordering and dispatching via LLM prompts after addressing parameter name mismatches and improving tool robustness.
- **Gaps/Issues**:
  - Internal API calls do not require separate authentication beyond the MCP server's own secret (assumed acceptable for demo).
  - LLM occasionally struggled with `order_part` vs `dispatch_part` choice, addressed via stronger preamble instructions.
  - Removed redundant `chat_with_well` tool.
- **Next Steps**:
  - Proceed to Sprint 19 (Optional Backlog/Tech Debt) or conclude v1.1.0 release based on overall readiness.
  - Consider further preamble refinement if LLM tool choice issues persist in wider testing.