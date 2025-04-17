# UX Flow - Oil & Gas GenAI Demo

## 1. Introduction
This document defines the user experience (UX) flow for the Oil & Gas Generative AI Demo application, designed for the primary persona, the Production Supervisor (Alex Carter). The flow outlines the key user interactions, navigation paths, and interface elements to ensure an intuitive, efficient, and engaging experience. The application visualizes oil wells in the Permian Basin, simulates faults, and enables interactions with a GenAI assistant for fault diagnosis and parts management. The UX flow is structured around the core features: homescreen, well detail view, fault simulation, and GenAI assistant workflows.

## 2. UX Flow Overview
The UX flow is divided into key user journeys, each mapping the Production Supervisor’s interactions with the application. The flow prioritizes simplicity, real-time feedback, and actionable outcomes, aligning with the demo’s authentication-free design and focus on showcasing AI capabilities.

### 2.1 Key User Journeys
1. **Monitor Wells on Homescreen**: View and filter well cards to assess operational status.
2. **Simulate a Fault**: Trigger a fault to test the system’s response.
3. **View Well Details**: Access detailed well information and fault specifics.
4. **Interact with GenAI Assistant**: Query well status, parts, or inventory and initiate workflows.
5. **Resolve Fault via Workflows**: Order or dispatch replacement parts.

## 3. Detailed UX Flow

### 3.1 Monitor Wells on Homescreen
**Goal**: Quickly assess the status of 25-30 wells and identify any issues.
**Flow**:
1. **Entry Point**: User lands on the homescreen after accessing the demo URL.
2. **Interface**:
   - A responsive grid displays 25-30 well cards, each showing:
     - Well ID/Name (e.g., “Well-01”).
     - Camp (e.g., “Midland”).
     - Formation (e.g., “Wolfcamp”).
     - Status Indicator (Green dot for operational, Red dot for fault).
   - A toolbar at the top includes:
     - “Trigger Fault” button.
     - Filter dropdowns for camp, formation, and status.
3. **Interactions**:
   - User scans the grid to monitor well statuses.
   - User selects filters (e.g., “Camp: Delaware”, “Status: Fault”) to narrow down wells.
   - Filtered wells update instantly in the grid.
4. **Feedback**:
   - Well cards load in under 2 seconds.
   - Filters apply in under 1 second with smooth transitions.
5. **Navigation**:
   - Click a well card to enter the Well Detail View (Journey 3).
   - Click “Trigger Fault” to simulate a fault (Journey 2).

### 3.2 Simulate a Fault
**Goal**: Trigger a fault to demonstrate real-time status updates and AI response.
**Flow**:
1. **Entry Point**: User clicks “Trigger Fault” button in the toolbar on the homescreen.
2. **Interface**:
   - A modal or dropdown (optional) allows selecting a specific well or “Random Well”.
   - Fault is triggered with a random part (from 10-15 parts) and fault type (e.g., mechanical, electrical).
3. **Interactions**:
   - User confirms fault trigger (e.g., “Trigger Fault on Well-12” or “Random”).
   - System assigns a fault and updates the selected well’s status.
4. **Feedback**:
   - A visual notification (e.g., toast message: “Fault triggered on Well-12: Pump Failure”) appears.
   - An optional audible alert (soft chime) signals the fault.
   - The well card’s status indicator changes to red within 1 second.
5. **Navigation**:
   - User clicks the affected well card to view details (Journey 3).
   - User returns to monitoring the grid (Journey 1).

### 3.3 View Well Details
**Goal**: Access detailed information about a well and its fault status.
**Flow**:
1. **Entry Point**: User clicks a well card from the homescreen.
2. **Interface**:
   - A split-screen layout:
     - **Left Panel**: Well Information
       - Well ID, Camp, Formation, Location (Lat/Long).
       - Operational Status, Last Maintenance Date.
       - Fault Details (if any): Part affected, fault type, timestamp.
     - **Right Panel**: GenAI Assistant Chat
       - Conversational interface with input field and message history.
   - A “Back” button returns to the homescreen.
3. **Interactions**:
   - User reviews well details to understand the context.
   - User scrolls through fault details if applicable.
   - User proceeds to interact with the assistant (Journey 4).
4. **Feedback**:
   - Well details load in under 2 seconds.
   - Fault information is clearly highlighted (e.g., bold text for affected part).
5. **Navigation**:
   - User types a query in the chat panel (Journey 4).
   - User clicks “Back” to return to the homescreen (Journey 1).

### 3.4 Interact with GenAI Assistant
**Goal**: Query well status, parts, or inventory and receive actionable insights.
**Flow**:
1. **Entry Point**: User is in the Well Detail View and focuses on the chat panel.
2. **Interface**:
   - Chat panel displays a welcome message (e.g., “Hi, I’m your assistant for Well-12. Ask about the well or fault.”).
   - Text input field at the bottom for user queries.
   - Message history shows previous interactions for the well.
3. **Interactions**:
   - User types a query, such as:
     - “What’s wrong with this well?”
     - “Tell me about the centrifugal pump.”
     - “Is a pressure sensor available nearby?”
   - Assistant responds within 3 seconds, using tool calling to fetch data:
     - Well status: “Well-12 has a mechanical fault in the centrifugal pump, detected at 2025-04-17 10:00.”
     - Part details: “The centrifugal pump is a high-pressure unit manufactured by Schlumberger.”
     - Inventory: “Pressure sensors are available: 3 at Warehouse W01, 2 at W02.”
   - Assistant suggests next steps (e.g., “Would you like to order a new pump or dispatch one from W01?”).
4. **Feedback**:
   - Responses are concise, formatted in markdown for readability (e.g., bullet points for inventory).
   - Chat history updates instantly, maintaining context.
5. **Navigation**:
   - User continues the conversation to initiate a workflow (Journey 5).
   - User clicks “Back” to return to the homescreen (Journey 1).

### 3.5 Resolve Fault via Workflows
**Goal**: Order or dispatch a replacement part to address a fault.
**Flow**:
1. **Entry Point**: User is in the chat panel of the Well Detail View, following a query about a fault or part.
2. **Interface**:
   - Chat panel displays the assistant’s response with workflow options (e.g., “Order a new pump” or “Dispatch from W01”).
   - Input field allows natural language instructions (e.g., “Dispatch a valve from the closest warehouse”).
3. **Interactions**:
   - User types or confirms a workflow, such as:
     - “Order a new pump for Well-12.”
     - “Dispatch a pressure sensor from W01.”
   - Assistant processes the request via tool calling and confirms:
     - “Pump ordered from the manufacturer for Well-12.”
     - “Pressure sensor dispatched from Warehouse W01.”
   - Confirmation includes a timestamp and reference ID (e.g., “Order #ORD123”).
4. **Feedback**:
   - Confirmation appears in the chat within 3 seconds.
   - Well status may update (e.g., “Pending Repair”) if applicable.
   - A toast notification reinforces the action (e.g., “Dispatch confirmed”).
5. **Navigation**:
   - User continues querying the assistant (Journey 4).
   - User returns to the Well Detail View or homescreen (Journeys 3 or 1).

## 4. UX Flow Diagram (Text-Based)
Below is a simplified text representation of the UX flow, showing navigation paths:

```
[Homescreen]
   ├── Monitor Wells (Grid)
   │   ├── Filter Wells (Camp, Formation, Status)
   │   └── Click Well Card → [Well Detail View]
   └── Trigger Fault (Toolbar)
       ├── Select Well or Random
       ├── Fault Notification
       └── Update Well Card → Click Card → [Well Detail View]

[Well Detail View]
   ├── View Well Info (Left Panel)
   ├── Interact with Assistant (Right Panel)
   │   ├── Query Well/Fault
   │   ├── Query Parts/Inventory
   │   └── Initiate Workflow
   │       ├── Order Part → Confirmation
   │       └── Dispatch Part → Confirmation
   └── Back → [Homescreen]
```

## 5. UX Design Principles
- **Clarity**: Use clear labels (e.g., “Trigger Fault”), color-coded status indicators (green/red), and concise assistant responses.
- **Speed**: Ensure fast load times (<2s for homescreen, <1s for status updates) and quick assistant responses (<3s).
- **Feedback**: Provide immediate visual/audible notifications for faults and workflow confirmations.
- **Simplicity**: Minimize clicks (e.g., one click to view well details, natural language for workflows).
- **Context**: Maintain chat history per well and highlight relevant fault details.

## 6. Edge Cases
- **No Faults Active**: Homescreen shows all green indicators; assistant prompts user to trigger a fault for demo purposes.
- **No Inventory Available**: Assistant informs user (e.g., “No pressure sensors in stock. Order from manufacturer?”) and suggests ordering.
- **Invalid Query**: Assistant responds with a helpful clarification (e.g., “I didn’t understand. Could you specify the well or part?”).
- **Slow Network**: Loading spinners appear for well details or assistant responses, with a fallback message if delayed beyond 5 seconds.

## 7. Notes
- The flow assumes a desktop or tablet interface, per the Production Supervisor’s work environment.
- No authentication is required, ensuring immediate access to the demo.
- The UX prioritizes real-time updates and AI-driven interactions to impress stakeholders.
- Future iterations may include geospatial maps or mobile support, but these are out of scope for the demo.