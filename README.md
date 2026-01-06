# Remote Project Hub – Frontend

React + TypeScript client for the Remote Project Hub Kanban API (`api-docs.json`). The UI covers authentication, organization/project management, project boards with drag-and-drop tasks, and an activity feed.

## Tech stack
- React + TypeScript + Vite
- React Router for navigation
- TanStack Query for server-state
- React Hook Form for forms
- @dnd-kit for drag-and-drop
- Vitest + Testing Library for component tests

## Running locally
1. Install dependencies
   ```bash
   npm install
   ```
2. Start the dev server (defaults to port 5173)
   ```bash
   npm run dev
   ```
3. Configure the backend base URL with an environment variable if needed:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

## Available scripts
- `npm run dev` – start Vite in dev mode
- `npm run build` – type-check and build the client
- `npm run preview` – preview the production build
- `npm run test` – run vitest component tests

## Notes
- Auth tokens are stored in `localStorage` for persistence across refreshes. If you need stricter security, swap to an in-memory store with refresh tokens to reduce XSS exposure.
- Dragging a task across columns calls `PATCH /api/projects/{projectId}/tasks/{taskId}/move` to keep the board in sync with the backend.
