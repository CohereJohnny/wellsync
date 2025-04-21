# Technical Debt Log

## Real-time Updates Enhancement (TD-001)
- **Priority**: Medium
- **Related Bug**: BUG-007
- **Description**: While basic real-time updates are implemented, there are still inconsistencies in the UI updates when well statuses change. Current implementation includes:
  - Case-insensitive status comparisons
  - React.memo optimization
  - Improved state management
  
- **Potential Solutions to Investigate**:
  1. Implement optimistic updates for immediate UI feedback
  2. Add retry mechanism for failed real-time subscriptions
  3. Consider using SWR or React Query for better cache management
  4. Add debouncing for rapid updates
  5. Implement proper error recovery for subscription failures
  
- **Impact**: Users may need to refresh the page to see the latest well status changes
- **Effort Estimate**: 1-2 days
- **Added**: 2024-03-21

## Deferred Testing (Sprints 8-10) (TD-002)
- **Priority**: Low (Demo app focus)
- **Related Sprints**: 8, 9, 10
- **Description**: Formal testing tasks were deferred during Sprints 8, 9, and 10 to prioritize core functionality for the demo. This includes unit tests, integration tests, end-to-end tests, and potentially accessibility/performance validation.
- **Specific Tasks Deferred**: 
  - **Sprint 8 (Implicit)**: Testing for `FaultHistoryTable` component (sorting, expand/collapse), `GET /faults` API, real-time fault updates on detail page.
  - **Sprint 9**: Unit tests for chat components (`ChatPanel`, state store), Cohere API integration testing, error handling verification (chat API, history API), responsive testing for chat, accessibility validation for chat.
  - **Sprint 10**: Unit tests for `/api/chat_history` routes, integration testing for history fetching/display in `ChatPanel`, validation of markdown rendering.
- **Impact**: Lower confidence in robustness, edge cases, and cross-browser/device compatibility. Potential for undiscovered bugs.
- **Effort Estimate**: 3-5 days (Combined estimate)
- **Added**: 2024-03-23

## API Error Handling Tests (Search Faults) (TD-003)
- **Priority**: Low (Demo app focus)
- **Related Sprint**: 12
- **Description**: Testing for specific error scenarios in the `/api/search_faults` endpoint was deferred to prioritize core functionality.
- **Specific Tests Deferred**:
  - **Test Case 1.5**: Test Cohere API error handling (e.g., by temporarily invalidating the API key and observing the 500 response).
  - **Test Case 1.6**: Test Supabase RPC error handling (e.g., by temporarily renaming/dropping the `search_faults` function and observing the 500 response).
- **Impact**: Reduced confidence in the robustness of the API endpoint under specific failure conditions (e.g., external API outages, database function issues).
- **Effort Estimate**: < 0.5 days
- **Added**: 2024-04-21
