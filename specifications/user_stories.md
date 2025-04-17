# User Stories - Oil & Gas GenAI Demo

## 1. Introduction
This document outlines the user stories for the Oil & Gas Generative AI Demo application, focusing on the primary persona, the Production Supervisor (Alex Carter). Each user story describes a specific need or task, formatted as "As a Production Supervisor, I want to [action] so that [benefit]." The stories are grouped by feature area to align with the Product Requirements Document (PRD) and support the demo’s goals of showcasing AI-driven fault management and inventory workflows.

## 2. User Stories

### 2.1 Homescreen - Well Card Grid
- **US-1**: As a Production Supervisor, I want to view a grid of 25-30 well cards displaying each well’s ID, camp, formation, and status indicator so that I can quickly assess the operational status of all wells in the Permian Basin.
- **US-2**: As a Production Supervisor, I want to filter wells by camp, formation, or status (operational/fault) so that I can focus on specific wells relevant to my current task.
- **US-3**: As a Production Supervisor, I want to see a well’s status indicator change from green to red in real-time when a fault is triggered so that I can immediately identify wells requiring attention.

### 2.2 Homescreen - Toolbar
- **US-4**: As a Production Supervisor, I want to trigger a fault on a specific or random well using a toolbar button so that I can simulate equipment issues and test the demo’s fault response capabilities.
- **US-5**: As a Production Supervisor, I want to receive a visual or audible notification when a fault is triggered so that I am alerted to new issues without constantly monitoring the grid.

### 2.3 Well Detail View
- **US-6**: As a Production Supervisor, I want to click a well card to view detailed information, including Well ID, camp, formation, location, status, last maintenance date, and fault details, so that I can understand the context of the well’s operation or issue.
- **US-7**: As a Production Supervisor, I want to see specific fault details, such as the affected part, fault type, and timestamp, so that I can assess the severity and urgency of the issue.

### 2.4 GenAI Assistant - Conversational Queries
- **US-8**: As a Production Supervisor, I want to ask the GenAI assistant questions about a well’s status or fault (e.g., “What’s wrong with Well-12?”) so that I can quickly get accurate information without navigating multiple systems.
- **US-9**: As a Production Supervisor, I want to query the assistant about a part’s details (e.g., “Tell me about the centrifugal pump”) so that I can confirm its specifications and suitability for the well.
- **US-10**: As a Production Supervisor, I want to ask the assistant to check part availability across warehouses (e.g., “Is a pressure sensor available nearby?”) so that I can identify the fastest way to resolve a fault.

### 2.5 GenAI Assistant - Workflows
- **US-11**: As a Production Supervisor, I want to instruct the assistant to order a replacement part from the manufacturer (e.g., “Order a new pump for Well-12”) so that I can initiate procurement without manual coordination.
- **US-12**: As a Production Supervisor, I want to ask the assistant to dispatch a replacement part from the nearest warehouse (e.g., “Dispatch a valve from the closest warehouse”) so that I can minimize downtime by sourcing parts quickly.
- **US-13**: As a Production Supervisor, I want the assistant to confirm the completion of workflows (e.g., “Part ordered” or “Part dispatched from Warehouse W01”) so that I can trust the action was successfully initiated.

### 2.6 GenAI Assistant - Context Awareness
- **US-14**: As a Production Supervisor, I want the assistant to maintain conversation history for each well so that I can continue discussions without repeating context.
- **US-15**: As a Production Supervisor, I want the assistant to provide concise, relevant responses based on the well’s data and my query so that I can make decisions efficiently.

### 2.7 Fault Simulation
- **US-16**: As a Production Supervisor, I want to trigger faults involving different parts (from a catalog of 10-15 parts) and fault types (e.g., mechanical, electrical) so that I can simulate a variety of scenarios for demo purposes.
- **US-17**: As a Production Supervisor, I want fault triggers to update the well’s status and log details instantly so that I can demonstrate real-time responsiveness to stakeholders.

### 2.8 Parts and Inventory Management
- **US-18**: As a Production Supervisor, I want access to a catalog of 10-15 parts with details like ID, name, description, and manufacturer so that I can reference them when addressing faults.
- **US-19**: As a Production Supervisor, I want to query inventory levels across 3-5 warehouses through the assistant so that I can make informed decisions about part sourcing.
- **US-20**: As a Production Supervisor, I want the assistant to recommend the nearest warehouse with available parts so that I can reduce logistics time.

## 3. Acceptance Criteria (Sample)
To ensure clarity, each user story includes acceptance criteria. Below are examples for key stories; others follow a similar structure.

- **US-1 (Well Card Grid)**:
  - Grid displays 25-30 well cards with correct ID, camp, formation, and status.
  - Cards are responsive and adapt to desktop/tablet screen sizes.
  - Status indicators show green for operational wells and red for faulty wells.
- **US-4 (Fault Trigger)**:
  - Toolbar button triggers a fault on a selected or random well.
  - Fault assigns a random part (from 10-15) and fault type.
  - Well’s status indicator updates to red within 1 second.
- **US-8 (Assistant Queries)**:
  - Assistant responds to well status queries with accurate data (e.g., fault details).
  - Response is delivered within 3 seconds and displayed in the chat panel.
- **US-11 (Order Part)**:
  - Assistant processes order request and confirms action (e.g., “PumpV Part ordered”).
  - Order details are logged in the backend for demo tracking.
- **US-12 (Dispatch Part)**:
  - Assistant identifies the nearest warehouse with the part in stock.
  - Dispatch request is confirmed with details (e.g., “Part dispatched from W01”).
  - Action is logged in the backend.

## 4. Notes
- Stories prioritize simplicity and speed, reflecting the demo’s authentication-free design and focus on showcasing AI capabilities.
- The Production Supervisor is assumed to have basic familiarity with oilfield operations and web interfaces, per the persona definition.
- Additional stories for secondary personas (e.g., Field Technician) may be added in future iterations if the demo scope expands.