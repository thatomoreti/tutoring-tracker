# Rutegang Tutoring Tracker

A full-stack app for managing tutoring sessions, learner progress, billing, and reporting — built for the Rutegang Tutoring Centre workflow.

**Live app:** https://tutoring-tracker-alpha.vercel.app
**API:** https://tutoring-tracker-karabo-api-b6bybegcbjbxe4as.southafricanorth-01.azurewebsites.net/api

## Features

- **Dashboard** — active learner count, sessions this month, outstanding balance at a glance
- **Learners** — full CRUD, with validation on names, grade (1–12), SA phone/email contact, and start date
- **Subjects** — CAPS curriculum subject list with hourly rates
- **Sessions** — log tutoring sessions per learner/subject, with duration, attendance, and notes
- **Invoices** — auto-generate invoices from unbilled sessions for a date range, view line-item breakdowns
- **Payments** — record payments against invoices, with automatic status updates (sent → partially paid → paid)
- **Reports** — revenue over time (chart), attendance summary per learner, outstanding balances

## Tech Stack

**Backend**
- Node.js, Express
- MySQL (Azure Database for MySQL — Flexible Server)
- `mysql2` (Promise-based driver)

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- Recharts (revenue chart)

**Infrastructure**
- Backend: Azure App Service (Linux, Node 22), CI/CD via GitHub Actions
- Database: Azure Database for MySQL Flexible Server
- Frontend: Vercel, auto-deploys from GitHub on push to `main`

## Project Structure

```
tutoring-tracker/                    (monorepo root — backend)
├── src/
│   ├── config/
│   │   └── db.js                   # MySQL connection pool
│   ├── controllers/                # business logic + validation per resource
│   │   ├── learners.controller.js
│   │   ├── subjects.controller.js
│   │   ├── sessions.controller.js
│   │   ├── progress.controller.js
│   │   ├── invoices.controller.js
│   │   ├── payments.controller.js
│   │   └── reports.controller.js
│   ├── routes/                     # thin route → controller mappings
│   ├── middleware/
│   │   └── errorHandler.js
│   └── app.js
├── .github/workflows/               # GitHub Actions CI/CD
├── server.js
├── package.json
│
└── tutoring-tracker-frontend/        (React app, deployed separately via Vercel)
    └── src/
        ├── api/                     # fetch wrappers per resource
        ├── components/              # forms, modals, navbar
        ├── pages/                   # Dashboard, Learners, Subjects, Sessions, Invoices, Reports
        └── App.jsx
```

## Database Schema

- `learners`, `subjects`, `learner_subjects` — learner records and enrollments
- `sessions` — logged tutoring sessions (drives attendance)
- `progress_records` — grades/assessment tracking
- `invoices`, `invoice_line_items` — formal billing, generated from unbilled sessions; line items snapshot the rate at billing time so historical invoices stay accurate if rates change later
- `payments` — money received, allocated against an invoice; wrapped in a DB transaction with invoice status updates so a partial failure can't leave inconsistent data
- `learner_balances` (view) — computed outstanding balance per learner, powers the Reports page

## Validation

Every write endpoint validates independently on both frontend and backend (so the rules hold even if the API is hit directly, bypassing the UI):

- Names: letters only, length-capped, trimmed
- Grade: numeric 1–12, formatted as `"Grade N"` on save
- Guardian contact: SA phone number or email, normalized before storage
- Session dates: can't be in the future or before the learner's own start date
- Session duration: restricted to a fixed set of values (30 min–4 hrs)
- Invoice/payment amounts: checked against outstanding balance, 2-decimal precision enforced, date ordering (period start/end, due date, payment date) validated
- Existence checks: `learner_id`, `subject_id`, and `invoice_id` are verified against the database before any dependent write

## Architecture Notes

**Routes → Controllers → Config layering:** routes only map endpoints to controller functions; controllers hold all business logic and validation; the DB connection pool is created once in `config/db.js` and shared everywhere. Keeps each concern isolated and easy to change independently.

**Connection pooling:** `mysql2`'s Promise-based pool (not a single connection) lets concurrent requests get handled without queuing behind one connection.

**Transactions for multi-table writes:** invoice generation (invoices + invoice_line_items) and payment recording (payments + invoice status update) are wrapped in DB transactions, so a failure partway through rolls back cleanly instead of leaving partial data.

## Setup (local development)

**Backend:**
```bash
npm install
cp .env.example .env   # fill in your Azure MySQL credentials
npm run dev
```

**Frontend:**
```bash
cd tutoring-tracker-frontend
npm install
# create .env with VITE_API_BASE_URL pointing at your backend
npm run dev
```

## Deployment

- **Backend** deploys automatically to Azure App Service on every push to `main`, via a GitHub Actions workflow using publish-profile authentication.
- **Frontend** deploys automatically to Vercel on every push to `main` (root directory set to `tutoring-tracker-frontend` since this is a monorepo).
- Environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` on the backend; `VITE_API_BASE_URL` on the frontend) are configured directly in each platform's settings, not committed to git.
