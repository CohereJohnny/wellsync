# Project Structure - WellSync AI

## 1. Introduction

This document outlines the project structure for **WellSync AI**, a web-based demo application showcasing AI-driven fault management for oil wells in the Permian Basin. Built with NextJS 14, Supabase, Cohere V2 TypeScript SDK (Command A, Embed v4, Rerank v3.5), Tailwind CSS, and Shadcn/UI, the structure supports 30 wells, 15 parts, and 3 warehouses. It aligns with the PRD, personas, user stories, UX flow, architecture, tech stack, data model, API, mock data, and design specifications, designed for a demo environment with no security or hardening. The structure is optimized for simplicity and compatibility with vibe coding in Cursor with Supabase MCP tools, incorporating a `/sprints` directory to support the standardized sprint workflow.

## 2. Goals

- **Organized**: Clear directory structure for frontend, backend logic, database assets, and sprint management.
- **Maintainable**: Logical separation of components, pages, utilities, and sprint documentation for rapid development.
- **Demo-Ready**: Includes all necessary files for the homescreen (well grid), well detail view, GenAI chat, and Supabase integration.
- **Developer-Friendly**: Leverages NextJS conventions, pnpm, and a sprint workflow for efficient vibe coding with Cursor.

## 3. Project Structure

The project is a NextJS monorepo hosted on Vercel, with Supabase for the backend and database. The root directory contains frontend code, configuration files, documentation, and a `/sprints` folder for managing sprint workflows.

```
wellsync-ai/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   └── search_faults/
│   │       └── route.ts
│   ├── well/[id]/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── badge.tsx
│   ├── ChatPanel.tsx
│   ├── FaultHistoryTable.tsx
│   ├── WellCard.tsx
│   ├── WellDetail.tsx
│   └── WellGrid.tsx
├── lib/
│   ├── cohere.ts
│   ├── supabase.ts
│   ├── types.ts
│   └── utils.ts
├── public/
│   ├── favicon.ico
│   └── logo.png
├── sprints/
│   ├── sprintplan.md
│   ├── tech_debt.md
│   ├── backlog.md
│   ├── bug_swatting.md
│   └── sprint_x/
│       ├── sprint_x_tasks.md
│       ├── sprint_x_updates.md
│       ├── sprint_x_report.md
│       └── sprint_x_testplan.md
├── supabase/
│   ├── migrations/
│   │   └── 20250417_create_tables.sql
│   └── mock_data.sql
├── .env.local
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── specifications/
    ├── prd.md
    ├── architecture.md
    ├── techstack.md
    ├── datamodel.md
    ├── api_specification.md
    ├── design_spec.md
    ├── mock_data.sql
    └── project_structure.md
```

## 4. Directory and File Details

### 4.1 Root Directory

- **.env.local**: Environment variables for Supabase and Cohere.
  ```env
  COHERE_API_KEY=<your-production-key>
  SUPABASE_URL=https://<supabase-project-id>.supabase.co
  SUPABASE_KEY=<supabase-anon-key>
  ```
- **.eslintrc.json**: ESLint configuration for code quality (TypeScript, React).
- **.gitignore**: Ignores `node_modules`, `.env`, and build artifacts.
- **next.config.js**: NextJS configuration (e.g., image optimization).
- **package.json**: Project metadata and dependencies (NextJS, Tailwind, Cohere SDK, etc.), managed with pnpm.
  ```json
  {
    "name": "wellsync-ai",
    "dependencies": {
      "@cohere-ai/sdk": "^2.x",
      "@supabase/supabase-js": "^2.x",
      "next": "14.x",
      "react": "^18.x",
      "tailwindcss": "^3.x",
      "@radix-ui/react-dropdown-menu": "^2.x",
      "lucide-react": "^0.x",
      "axios": "^1.x",
      "react-markdown": "^9.x",
      "zustand": "^4.x"
    },
    "devDependencies": {
      "typescript": "^5.x",
      "eslint": "^8.x",
      "prettier": "^3.x",
      "@types/node": "^20.x",
      "@types/react": "^18.x"
    }
  }
  ```
- **pnpm-lock.yaml**: Lockfile for pnpm dependency management.
- **README.md**: Project overview, setup instructions, and demo usage.
- **tailwind.config.js**: Tailwind CSS configuration with custom colors (navy, teal, green, red).
  ```js
  module.exports = {
    content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
    theme: {
      extend: {
        colors: {
          navy: { 900: "#1E3A8A" },
          teal: { 500: "#2DD4BF" },
          green: { 500: "#22C55E" },
          red: { 500: "#EF4444" }
        }
      }
    }
  };
  ```
- **tsconfig.json**: TypeScript configuration for NextJS and strict type checking.

### 4.2 app/

Contains NextJS pages, API routes, and global styles.

- **app/globals.css**: Global Tailwind CSS styles with Inter font.
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  body {
    font-family: 'Inter', sans-serif;
  }
  ```
- **app/layout.tsx**: Root layout with navbar and metadata.
  ```tsx
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body className="bg-gray-50">{children}</body>
      </html>
    );
  }
  ```
- **app/page.tsx**: Homescreen with well grid and toolbar.
  ```tsx
  import WellGrid from "@/components/WellGrid";
  export default function Home() {
    return (
      <main className="container mx-auto p-8">
        <WellGrid />
      </main>
    );
  }
  ```
- **app/well/[id]/page.tsx**: Well detail view with split layout (info and chat).
  ```tsx
  import WellDetail from "@/components/WellDetail";
  import ChatPanel from "@/components/ChatPanel";
  export default function WellPage({ params }: { params: { id: string } }) {
    return (
      <div className="container mx-auto p-8 flex gap-6">
        <WellDetail wellId={params.id} className="w-3/5" />
        <ChatPanel wellId={params.id} className="w-2/5" />
      </div>
    );
  }
  ```
- **app/api/chat/route.ts**: API route for Cohere Command A chat queries.
  ```tsx
  import { NextResponse } from "next/server";
  import Cohere from "@cohere-ai/sdk";
  const cohere = new Cohere({ token: process.env.COHERE_API_KEY! });
  export async function POST(request: Request) {
    const { query, wellId } = await request.json();
    const response = await cohere.chat({
      model: "command-a-03-2025",
      messages: [{ role: "user", content: query }],
    });
    return NextResponse.json({ response: response.text });
  }
  ```
- **app/api/search_faults/route.ts**: API route for semantic fault search (Embed v4, Rerank).
  ```tsx
  import { NextResponse } from "next/server";
  import Cohere from "@cohere-ai/sdk";
  import { createClient } from "@supabase/supabase-js";
  const cohere = new Cohere({ token: process.env.COHERE_API_KEY! });
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  export async function POST(request: Request) {
    const { query, top_n } = await request.json();
    const embedResponse = await cohere.embed({
      model: "embed-v4-03-2025",
      inputType: "search_query",
      texts: [query],
    });
    const { data: faults } = await supabase.rpc("search_faults", { query_embedding: embedResponse.embeddings[0] });
    const rerankResponse = await cohere.rerank({
      model: "rerank-v3.5",
      query,
      documents: faults.map((f: any) => f.description),
      topN: top_n,
    });
    return NextResponse.json(rerankResponse.results);
  }
  ```

### 4.3 components/

Contains reusable UI components, including Shadcn/UI primitives.

- **components/ui/**: Shadcn/UI components (customized for WellSync AI).
  - **button.tsx**: Primary, secondary, danger buttons with Tailwind styles.
  - **card.tsx**: Card wrapper for well cards and panels.
  - **dropdown-menu.tsx**: Filter dropdowns for camp, formation, status.
  - **input.tsx**: Chat input with teal focus border.
  - **table.tsx**: Fault history table with striped rows.
  - **badge.tsx**: Status badges (green for Operational, red for Fault).
- **components/ChatPanel.tsx**: GenAI chat panel with message list and input.
  ```tsx
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  export default function ChatPanel({ wellId, className }: { wellId: string; className?: string }) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="h-[600px] overflow-y-auto">{/* Messages */}</div>
        <div className="flex gap-2">
          <Input placeholder="Ask about Well..." />
          <Button variant="primary">Send</Button>
        </div>
      </div>
    );
  }
  ```
- **components/FaultHistoryTable.tsx**: Table for fault history in well detail view.
- **components/WellCard.tsx**: Well card for homescreen grid.
  ```tsx
  import { Badge } from "@/components/ui/badge";
  export default function WellCard({ well }: { well: any }) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-4 hover:scale-105 transition-transform">
        <h2 className="text-lg font-bold text-navy-900">{well.name}</h2>
        <Badge variant={well.status === "Operational" ? "success" : "danger"}>{well.status}</Badge>
        <p className="text-sm text-gray-600">Camp: {well.camp}</p>
        <p className="text-sm text-gray-600">Formation: {well.formation}</p>
      </div>
    );
  }
  ```
- **components/WellDetail.tsx**: Well info panel with fault history table.
- **components/WellGrid.tsx**: Homescreen grid with toolbar and well cards.

### 4.4 lib/

Contains utilities and configurations.

- **lib/cohere.ts**: Cohere SDK initialization and helper functions.
  ```ts
  import Cohere from "@cohere-ai/sdk";
  export const cohere = new Cohere({ token: process.env.COHERE_API_KEY! });
  ```
- **lib/supabase.ts**: Supabase client initialization and queries.
  ```ts
  import { createClient } from "@supabase/supabase-js";
  export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  ```
- **lib/types.ts**: TypeScript interfaces for wells, parts, faults, etc.
  ```ts
  export interface Well {
    id: string;
    name: string;
    camp: string;
    formation: string;
    status: "Operational" | "Fault" | "Pending Repair";
  }
  ```
- **lib/utils.ts**: General utilities (e.g., formatDate, debounce).

### 4.5 public/

Static assets for the app.

- **public/favicon.ico**: WellSync AI favicon (oil rig icon).
- **public/logo.png**: App logo (navy/teal, modern rig silhouette).

### 4.6 sprints/

Manages sprint workflows per the Cursor Rule: Sprint Workflow, supporting vibe coding.

- **sprints/sprintplan.md**: Master plan outlining high-level goals and tasks for all sprints.
  ```markdown
  # WellSync AI Sprint Plan
  ## Sprint 1
  - Set up NextJS project, Supabase schema, and mock data.
  - Implement homescreen with well grid.
  ## Sprint 2
  - Build well detail view with fault history.
  - Integrate Cohere chat API.
  ...
  ```
- **sprints/tech_debt.md**: Tracks non-critical technical issues or refactors.
  ```markdown
  # Tech Debt
  - Optimize fault search query performance.
  - Refactor WellCard props for reusability.
  ```
- **sprints/backlog.md**: Captures new feature ideas or non-critical enhancements.
  ```markdown
  # Backlog
  - Add Mapbox for well visualization.
  - Implement dark mode toggle.
  ```
- **sprints/bug_swatting.md**: Logs and tracks bug fixes outside planned tasks.
  ```markdown
  # Bug Swatting
  - [2025-04-18] Fixed chat input focus issue in WellDetail view.
  ```
- **sprints/sprint_x/**: Subdirectory for each sprint (e.g., `sprint_1`, `sprint_2`).
  - **sprint_x_tasks.md**: Detailed task list with checkboxes.
    ```markdown
    # Sprint 1 Tasks
    - [ ] Initialize NextJS project with pnpm.
    - [ ] Set up Supabase client and schema.
    - [ ] Create WellGrid component.
    ```
  - **sprint_x_updates.md**: Ongoing notes, code snippets, and progress.
    ```markdown
    # Sprint 1 Updates
    - 2025-04-18: Configured Supabase client, ran `supabase db push`.
    - Added WellCard component, needs hover animation tweak.
    ```
  - **sprint_x_report.md**: Final sprint summary (populated at sprint end).
    ```markdown
    # Sprint 1 Report
    ## Summary
    Completed project setup and homescreen grid.
    ## Completed Tasks
    - Initialized NextJS project.
    - Set up Supabase schema.
    ## Notes
    Minor delay in Tailwind config due to font import.
    ```
  - **sprint_x_testplan.md**: Instructions for end-user testing.
    ```markdown
    # Sprint 1 Test Plan
    1. Verify well grid displays 30 wells.
    2. Test filter dropdowns (camp, formation).
    3. Check Realtime updates on fault trigger.
    ```

### 4.7 supabase/

Supabase-specific files, managed via Supabase CLI or MCP tools in Cursor.

- **supabase/migrations/20250417_create_tables.sql**: Schema from `datamodel.md`.
  ```sql
  CREATE TABLE wells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    camp VARCHAR(50) NOT NULL,
    ...
  );
  CREATE EXTENSION vector;
  CREATE TABLE fault_embeddings (
    fault_id UUID PRIMARY KEY REFERENCES faults(fault_id),
    embedding VECTOR(1024) NOT NULL
  );
  ```
- **supabase/mock_data.sql**: Mock data from `mock_data.sql` (30 wells, 15 parts, 3 warehouses, 150 faults).

### 4.8 specifications/

Documentation for the project.

- **specifications/prd.md**: Product Requirements Document.
- **specifications/architecture.md**: System architecture.
- **specifications/techstack.md**: Technology stack (NextJS, Supabase, Cohere).
- **specifications/datamodel.md**: Database schema.
- **specifications/api_specification.md**: REST API endpoints.
- **specifications/design_spec.md**: UI/UX design and style guide.
- **specifications/mock_data.sql**: Mock data SQL.
- **specifications/project_structure.md**: This file.

## 5. Sprint Workflow (Cursor Rule)

The `/sprints` directory follows your **Cursor Rule: Sprint Workflow** for vibe coding:

1. **Sprint Initialization**:
   - Create branch `sprint-x` for all sprint changes.
   - Create `sprints/sprint_x/` with `sprint_x_tasks