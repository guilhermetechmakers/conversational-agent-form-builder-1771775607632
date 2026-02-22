# Conversational Agent Form Builder

An AI-first conversational form builder that lets users create shareable "agents" which collect structured data via natural language dialogue instead of traditional step-by-step forms.

## Features

- **Landing Page** – Hero, feature highlights, live demo link, pricing teaser
- **Authentication** – Login, signup, password reset, email verification
- **Dashboard** – Summary cards, agents list, collapsible sidebar
- **Agent Builder** – Metadata, fields editor, persona & tone configuration
- **Public Chat** – Visitor-facing conversational interface
- **Sessions** – List and detail views for conversation sessions
- **Integrations** – Webhooks configuration
- **Content** – Docs/FAQ upload for agent context
- **Settings & Profile** – Account and API key management
- **Pricing & About** – Marketing pages

## Tech Stack

- React 19 + TypeScript
- Vite + SWC
- React Router 6
- Tailwind CSS v3
- Shadcn/Radix UI
- React Hook Form + Zod
- TanStack React Query
- Sonner (toasts)
- Recharts (data viz)
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run build
```

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Production build
- `npm run preview` – Preview production build
- `npm run lint` – Run ESLint

## Design System

Colors follow the UI Guide:
- Primary: #0B5FFF (blue)
- Accent: #00C48C (green)
- Neutral dark: #0F1724
- Neutral mid: #475569
- Neutral light: #F8FAFC

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── layout/     # Layout components (sidebar, header)
│   └── ui/         # Base UI components (button, card, input)
├── lib/            # Utilities (api, utils)
├── pages/          # Route pages
│   ├── auth/       # Login, signup, password reset, email verification
│   ├── dashboard/  # Dashboard, agents, sessions, etc.
│   └── ...
└── routes/         # React Router configuration
```

## License

Private - All rights reserved.
