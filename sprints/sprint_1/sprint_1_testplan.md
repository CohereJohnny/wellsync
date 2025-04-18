# Sprint X Test Plan

## Overview
[Describe sprint testing goals, e.g., Validate homescreen grid and Realtime updates for 30 wells.]

## Test Cases
### Feature: [e.g., Homescreen Grid]
- [ ] Verify 30 well cards display in 5x6 grid (Chrome, Firefox).
- [ ] Test filter dropdowns for camp (Midland, Delaware), formation (Wolfcamp, Spraberry, Bone Spring), and status (Operational, Fault).
- [ ] Confirm Realtime updates on fault trigger (<1s).

### Feature: [e.g., Well Detail View]
- [ ] Verify well details (name, status, camp, etc.) display correctly.
- [ ] Test fault history table sorting by timestamp.
- [ ] Confirm chat panel renders assistant responses in markdown.

### Feature: [e.g., GenAI Chat]
- [ ] Verify natural language queries (e.g., “What’s wrong with Well-12?”) return accurate responses.
- [ ] Test workflow execution (e.g., “Dispatch pump from W01”) with confirmation.

## Browser Testing
- **Chrome**: [Version, e.g., Latest as of 2025-04-18]
- **Firefox**: [Version, e.g., Latest as of 2025-04-18]
- **Notes**: Ensure no UI glitches or console errors.

## Notes
- Draft test cases during sprint planning, refine during execution.
- Focus on demo-critical features (e.g., well grid, chat, fault search).
- Run tests in browser after `pnpm run build` during sprint review.