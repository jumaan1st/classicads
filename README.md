# ClassicAds — Interior & Exterior Design Platform

A modern full-stack web application for an interior and exterior design company. It combines a customer-facing marketing site, AI-powered quotation, CRM, project tracking, employee management, billing, and role-based dashboards. All **dummy data is served from API routes** (`app/api/**/route.ts`) so you can later connect the same endpoints to your database and storage.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Fonts:** Cormorant Garamond (headings), Outfit (body)

## Design

- Dark theme with **beige/gold (amber) accents**
- Glassmorphism cards, clean dashboards
- Mobile-first, responsive
- Premium, minimal luxury aesthetic

## User Roles

| Role     | Access |
|----------|--------|
| Customer | Marketing site, quote, contact; dashboard overview and “My Projects” |
| Employee | Dashboard: overview, leads, projects, invoices |
| Admin    | Full dashboard: overview, CRM, projects, invoices, employees, analytics |

## API Routes (Dummy Data)

All data is returned from these route handlers. Replace the in-memory arrays with DB/storage calls when integrating.

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/services` | GET | Services catalog (query: `category`, `featured`, `slug`) |
| `/api/leads` | GET | CRM leads (query: `status`, `assignedTo`) |
| `/api/projects` | GET | Projects (query: `id`, `status`, `assignedTo`) |
| `/api/employees` | GET | Employees (query: `id`, `role`, `department`) |
| `/api/invoices` | GET | Invoices (query: `id`, `status`, `projectId`) |
| `/api/analytics` | GET | Revenue, conversion, service popularity, employee performance |
| `/api/quote` | POST | AI quote suggestion (body: `roomSize`, `budget`, etc.) |
| `/api/auth/me` | GET | Current user (query: `role` for demo) |

## Pages

- **Marketing:** `/`, `/services`, `/services/[slug]`, `/quote`, `/contact`
- **Auth (mock):** `/login` — choose role and “sign in” to dashboard
- **Dashboard:** `/dashboard`, `/dashboard/leads`, `/dashboard/projects`, `/dashboard/invoices`, `/dashboard/employees`, `/dashboard/analytics`

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Login** → choose **Employee** or **Admin** → **Continue** to open the dashboard.

## Integrating Real Backend

1. **Database:** Replace dummy arrays in each `app/api/*/route.ts` with your ORM (e.g. Prisma, Drizzle) or direct DB calls.
2. **Auth:** Replace `/api/auth/me` with session/JWT and enforce role in middleware or in each route.
3. **Storage:** For project images, bills, and uploads, use your cloud bucket (S3, GCS, etc.); store URLs in the DB and return them from the same API shapes.
4. **Quote AI:** In `/api/quote/route.ts`, call your AI service or pricing engine with the request body and return the same response shape.

The frontend already consumes these API responses; no UI changes required when you switch to real data.
