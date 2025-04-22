# Sprint 17 Tasks: MCP Server - Core Query Tools & Resources

## Goal
Implement MCP tools for querying data and expose static lists as resources.

## Tasks

- [x] Implement `get_wells_by_status` tool (filters: status, potentially camp/formation).
- [x] Implement `get_faults_by_well` tool.
- [x] Implement `get_part_inventory` tool (check stock for a specific part).
- [x] Expose `Parts` list as an MCP Resource.
- [x] Expose `Fault Types` list as an MCP Resource.
- [x] Define clear schemas (parameters, descriptions) for tools and resources.

## Sprint Review
- **Demo Readiness**: Core query tools (`get_wells_by_status`, `get_faults_by_well`, `get_part_inventory`) and resource lists (`parts_list`, `fault_types_list`) are implemented on the MCP server.
- **Gaps/Issues**: The tools haven't been tested via actual LLM interaction yet. The workflow tools (chat, order, dispatch) are pending.
- **Next Steps**: Proceed to Sprint 18 to implement the workflow tools via API integration. 