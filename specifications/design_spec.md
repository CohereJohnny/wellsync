# Design Specification - Oil & Gas GenAI Demo

## 1. Introduction

This document outlines the UI/UX design and style guide for the Oil & Gas Generative AI Demo, a web-based application showcasing AI-driven fault management for oil wells in the Permian Basin. The design targets the Production Supervisor persona, emphasizing a clean, modern aesthetic inspired by the Tailwind CSS website (tailwindcss.com). It prioritizes clarity, efficiency, and actionable insights for managing 30 wells, 15 parts, and 3 warehouses, with real-time updates and Cohere-powered GenAI interactions (Command A, Embed v4, Rerank v3.5). Built with NextJS, Tailwind CSS, and Shadcn/UI, the design is optimized for a demo environment with no security or hardening.

## 2. Design Goals

- **Persona-Centric**: Reflect the Production Supervisor’s need for quick access to well statuses, fault details, inventory, and actionable workflows (e.g., order/dispatch parts).
- **Clean and Modern**: Adopt a minimalist, professional look inspired by tailwindcss.com, with clear typography, ample whitespace, and intuitive navigation.
- **Functional**: Ensure data (well cards, fault history, chat) is scannable and actionable, with real-time updates for fault alerts.
- **Responsive**: Support desktop and tablet views, prioritizing desktop for supervisor workflows.
- **Demo-Ready**: Visually impressive to showcase AI capabilities, with a polished yet simple interface.

## 3. User Experience (UX)

### 3.1 Persona: Production Supervisor

- **Profile**: Oversees well operations, monitors faults, manages inventory, and coordinates repairs. Values efficiency, real-time data, and clear communication.
- **Needs**:
  - Monitor 30 wells at a glance with status indicators (Operational/Fault).
  - Filter wells by camp, formation, or status.
  - Dive into fault details and history for a well.
  - Query the GenAI assistant for insights (e.g., “Similar faults?”) and execute workflows.
  - Check part availability and initiate orders/dispatches.
- **Pain Points**:
  - Overwhelmed by scattered data across systems.
  - Delays in identifying and resolving faults.
  - Complex interfaces that slow decision-making.

### 3.2 UX Flow

1. **Homescreen (Well Card Grid)**:
   - Displays 30 well cards in a 5x6 grid, each showing name, status (green/red), camp, and formation.
   - Toolbar above grid for filtering (camp, formation, status) and triggering faults.
   - Clicking a card navigates to the Well Detail View.
2. **Well Detail View**:
   - Split layout: left (well info, fault history); right (GenAI chat panel).
   - Well info includes name, status, location, last maintenance, and current fault details.
   - Fault history table lists past faults (part, type, description, timestamp).
   - Chat panel allows natural language queries (e.g., “What’s wrong?”) and workflows (e.g., “Order pump”).
3. **Real-time Updates**:
   - Well cards update status (e.g., red for fault) via Supabase Realtime subscriptions.
   - Chat panel reflects inventory changes or fault triggers instantly.
4. **Assistant Interactions**:
   - Query fault details, inventory, or similar faults (semantic search).
   - Execute workflows (order/dispatch) with confirmation messages (e.g., “Pump dispatched from W01”).

### 3.3 Wireframe (Text-Based)

```
[Homescreen]
--------------------------------------------------
| [Toolbar: Filter (Camp, Formation, Status) | Trigger Fault] |
--------------------------------------------------
| [Well Card] [Well Card] [Well Card] [Well Card] [Well Card] |
| [Well Card] [Well Card] [Well Card] [Well Card] [Well Card] |
| [Well Card] [Well Card] [Well Card] [Well Card] [Well Card] |
| [Well Card] [Well Card] [Well Card] [Well Card] [Well Card] |
| [Well Card] [Well Card] [Well Card] [Well Card] [Well Card] |
| [Well Card] [Well Card] [Well Card] [Well Card] [Well Card] |
--------------------------------------------------

[Well Card]
-------------------
| Well-01         |
| Status: Operational |
| Camp: Midland   |
| Formation: Wolfcamp |
-------------------

[Well Detail View]
--------------------------------------------------
| [Well Info]                     | [GenAI Chat Panel]           |
| Name: Well-01                   | ----------------------------- |
| Status: Fault                   | [Messages]                  |
| Camp: Midland                   | User: What’s wrong?         |
| Formation: Wolfcamp             | Assistant: Mechanical fault |
| Latitude: 31.8075               | User: Order pump            |
| Longitude: -102.1123            | Assistant: Pump ordered     |
| Last Maintenance: 2025-03-15    | ----------------------------- |
| Fault Details: Pump, Mechanical | [Input: Type query...]      |
| ------------------------------- |                             |
| [Fault History Table]           |                             |
| Fault ID | Part | Type | Desc | Time                       |
| ...                             |                             |
--------------------------------------------------
```

## 4. User Interface (UI)

### 4.1 Design Inspiration: Tailwind CSS Website

- **Minimalist Layout**: Clean grid with generous whitespace, as seen in tailwindcss.com’s component showcases.
- **Typography**: Sans-serif fonts (e.g., Inter) for readability, with bold headings and subtle text hierarchy.
- **Color Palette**: Professional, muted tones with high contrast for data visibility.
- **Components**: Card-based design for wells, sleek buttons, and modern input fields, inspired by tailwindcss.com’s utility-first styling.
- **Interactivity**: Hover states, subtle animations (e.g., card scaling), and real-time feedback, mirroring tailwindcss.com’s responsive examples.

### 4.2 Style Guide

#### 4.2.1 Color Palette

Inspired by tailwindcss.com’s professional and approachable palette, tailored for the oil & gas industry.

| Color          | Hex       | Usage                                      |
|----------------|-----------|--------------------------------------------|
| Primary (Navy) | #1E3A8A   | Headers, buttons, active states            |
| Secondary (Teal)| #2DD4BF   | Accents, links, hover states               |
| Success (Green)| #22C55E   | Operational well status, success messages  |
| Danger (Red)   | #EF4444   | Fault well status, error messages          |
| Neutral (Gray) | #6B7280   | Text, borders, secondary elements          |
| Background     | #F9FAFB   | Main background, cards                     |
| White          | #FFFFFF   | Card backgrounds, text on dark backgrounds |

#### 4.2.2 Typography

- **Font Family**: Inter (via Tailwind CSS), sans-serif for clarity and modernity.
- **Sizes**:
  - Heading 1: 24px, bold (page titles, e.g., “Well Detail”).
  - Heading 2: 20px, bold (section titles, e.g., “Fault History”).
  - Body: 16px, regular (paragraphs, table content).
  - Small: 14px, regular (timestamps, secondary info).
- **Line Height**: 1.5 for body text, 1.2 for headings.
- **Weights**: Regular (400), Medium (500), Bold (700).
- **Usage**: High contrast (e.g., navy on white) for readability, with gray for secondary text.

#### 4.2.3 Spacing

- **Padding**: 16px (cards, buttons), 24px (sections), 32px (page margins).
- **Margin**: 8px (between elements), 16px (between sections).
- **Grid Gap**: 16px for well card grid.
- **Rationale**: Ample spacing ensures scannability, inspired by tailwindcss.com’s airy layouts.

#### 4.2.4 Components (Using Shadcn/UI)

- **Well Card**:
  - Size: 200x150px, shadow-sm, rounded-lg.
  - Content: Name (H2), Status (badge: green/red), Camp/Formation (small text).
  - Hover: Scale 1.05, shadow-md transition.
- **Toolbar**:
  - Sticky top bar, bg-white, shadow-sm.
  - Filters: Dropdowns (camp, formation, status) with teal accents.
  - Fault Trigger: Button (danger red, hover: darken).
- **Well Detail Panel**:
  - Left: Card with well info (H1, key-value pairs), fault history table (striped rows).
  - Right: Chat panel (bg-gray-50, rounded-lg), with scrollable message list and input field.
- **Chat Messages**:
  - User: Right-aligned, teal bg, rounded-tr-none.
  - Assistant: Left-aligned, white bg, rounded-tl-none, markdown support.
- **Buttons**:
  - Primary: Navy bg, white text, hover: lighten, rounded-md.
  - Secondary: Teal outline, teal text, hover: teal bg.
  - Danger: Red bg, white text, hover: darken.
- **Table**:
  - Fault history: Bordered, striped (gray-100), sortable headers, hover: highlight row.
- **Input Field**:
  - Chat input: Full-width, bg-white, border-gray-300, focus: teal border, rounded-md.

#### 4.2.5 Icons

- **Library**: Lucide Icons (via Shadcn/UI).
- **Usage**: Well status (check-circle for Operational, alert-triangle for Fault), filter (sliders), chat (message-square), workflows (truck for dispatch).
- **Size**: 20px, navy or teal, inline with text.
- **Rationale**: Simple, modern icons enhance usability without clutter.

## 5. UI Components and Layout

### 5.1 Homescreen

- **Layout**: Full-width container, 32px padding, bg-gray-50.
- **Toolbar**: Sticky, 64px height, bg-white, shadow-sm, with dropdowns (camp, formation, status) and fault trigger button.
- **Well Grid**: 5x6 grid, 16px gap, responsive to 3x10 on tablet (min-width: 768px).
- **Well Card**: Card with bg-white, shadow-sm, rounded-lg, status badge (green/red), hover: scale 1.05.

### 5.2 Well Detail View

- **Layout**: Split view, 60% (left: well info), 40% (right: chat), 24px gap, max-width 1280px.
- **Well Info Panel**:
  - Card: bg-white, shadow-sm, rounded-lg, 16px padding.
  - Content: H1 (well name), key-value pairs (status, camp, etc.), fault details (bold if active).
  - Fault History: Table with columns (Fault ID, Part, Type, Description, Timestamp), striped rows, sortable by timestamp.
- **Chat Panel**:
  - Card: bg-gray-50, shadow-sm, rounded-lg, 16px padding.
  - Messages: Scrollable, max-height 600px, user/assistant bubbles with teal/white styling.
  - Input: Full-width, 48px height, teal focus border, send button (teal, icon: arrow-right).

### 5.3 Responsive Design

- **Desktop (min-width: 1024px)**: Full 5x6 grid, split well detail view.
- **Tablet (min-width: 768px)**: 3x10 grid, split view with adjusted font sizes (14px body).
- **Mobile (unsupported)**: Not prioritized, as supervisors use desktops/tablets for operational tasks.
- **Rationale**: Tailwind’s responsive utilities (e.g., `md:grid-cols-3`) ensure flexibility.

## 6. Design Considerations

- **Supervisor Needs**: Well cards use bold status badges for quick scanning, and the chat panel prioritizes actionable queries (e.g., “Dispatch pump”). Fault history is tabular for clarity.
- **Tailwind Inspiration**: Mimics tailwindcss.com’s clean typography (Inter), muted palette, and card-based layouts, adapted for oil & gas with navy/teal tones.
- **Real-time Feedback**: Status changes (e.g., fault trigger) animate (pulse effect) to draw attention, with Realtime subscriptions updating cards instantly.
- **Accessibility**:
  - High contrast (navy on white, WCAG 2.1 compliant).
  - Keyboard navigation for filters and chat input.
  - ARIA labels for well cards and chat messages (via Shadcn/UI).
- **Demo Appeal**: Polished animations (e.g., card hover, chat message fade-in) and modern styling impress stakeholders, showcasing AI capabilities.

## 7. Mockup Reference (Tailwind CSS Classes)

### Well Card
```html
<div class="bg-white shadow-sm rounded-lg p-4 hover:scale-105 transition-transform">
  <h2 class="text-lg font-bold text-navy-900">Well-01</h2>
  <span class="inline-block px-2 py-1 text-sm font-medium text-white bg-green-500 rounded">Operational</span>
  <p class="text-sm text-gray-600">Camp: Midland</p>
  <p class="text-sm text-gray-600">Formation: Wolfcamp</p>
</div>
```

### Toolbar
```html
<div class="sticky top-0 bg-white shadow-sm p-4 flex gap-4">
  <select class="border-gray-300 rounded-md focus:ring-teal-500">
    <option>Camp: All</option>
    <option>Midland</option>
    <option>Delaware</option>
  </select>
  <button class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Trigger Fault</button>
</div>
```

### Chat Message
```html
<div class="flex justify-end mb-2">
  <div class="bg-teal-100 text-navy-900 rounded-lg rounded-tr-none p-3 max-w-xs">
    What’s wrong with Well-12?
  </div>
</div>
<div class="flex justify-start mb-2">
  <div class="bg-white text-navy-900 rounded-lg rounded-tl-none p-3 max-w-xs">
    Mechanical fault in centrifugal pump, detected 2025-04-14.
  </div>
</div>
```

## 8. Assumptions

- Tailwind CSS (3.x) and Shadcn/UI provide sufficient components for the UI.
- Desktop/tablet resolutions (1024px+) are primary, per supervisor workflow.
- Mock data (30 wells, 15 parts, 3 warehouses, 150 faults) supports realistic UI scenarios.
- Cohere assistant responses render correctly in markdown via React-Markdown.

## 9. Future Considerations

- Add dark mode for night-shift supervisors (toggle via Tailwind `dark:` classes).
- Integrate Mapbox for a geospatial well map on the homescreen.
- Enhance chat panel with suggested queries (e.g., “Check inventory”).
- Use Tailwind’s animation utilities for more dynamic fault alerts.

## 10. Relevant Memories

Your focus on realistic demo data and vibe coding with Cursor (e.g., insurance underwriting demo, April 6, 2025) informs the clean, functional design tailored to the Production Supervisor. The choice of tailwindcss.com as inspiration aligns with your preference for modern, professional aesthetics, similar to your emphasis on impactful, user-centric interfaces in past projects. The design prioritizes the supervisor’s need for efficiency, reflecting your interest in practical AI-driven solutions.