# Pwned Proxy — Frontend

React + TypeScript + Vite frontend for the Pwned Proxy project.

Users can check if their email appears in stealer logs or data breaches.
The frontend calls the local Django backend, which holds the HIBP API key
and forwards requests to HaveIBeenPwned — the browser never touches the key.

## Structure

```
ui/
├── src/
│   ├── pages/          # Route-level pages (Home, Email, Passwords, About)
│   ├── features/       # Feature components (EmailChecker, PasswordChecker)
│   ├── components/     # Shared UI (Header, Footer)
│   ├── layouts/        # RootLayout wrapping all pages
│   └── lib/
│       └── api.ts      # All fetch calls to the backend
├── vite.config.ts      # Dev server + proxy config (points /api/* to backend)
└── index.html
```

## Prerequisites

- Node.js 18+
- The Django backend running on `http://localhost:8000`
  → see `../app/README.md` for backend setup

## Setup & run

> **Backend must be running first** — see [`../app/README.md`](../app/README.md)

```bash
# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
# → http://localhost:5173
```

Vite automatically proxies `/api/*` requests to the backend (configured in `vite.config.ts`).

## Build (production)

```bash
npm run build   # output goes to dist/
```

