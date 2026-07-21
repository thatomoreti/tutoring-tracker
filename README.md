# Tutoring Tracker

A full-stack app for managing tutoring sessions, learner progress, and billing — built as part of the Rutegang tutoring workflow.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** Azure Database for MySQL (Flexible Server)
- **Driver:** `mysql2` (Promise-based)

## Project Structure

```
tutoring-tracker/
├── src/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── routes/
│   │   ├── learners.routes.js
│   │   ├── subjects.routes.js
│   │   ├── sessions.routes.js
│   │   ├── progress.routes.js
│   │   ├── invoices.routes.js
│   │   └── payments.routes.js
│   ├── controllers/
│   │   ├── learners.controller.js
│   │   ├── subjects.controller.js
│   │   ├── sessions.controller.js
│   │   ├── progress.controller.js
│   │   ├── invoices.controller.js
│   │   └── payments.controller.js
│   ├── middleware/
│   │   └── errorHandler.js
│   └── app.js                     # Express app + middleware + route wiring
├── .env                            # local secrets (not committed)
├── .env.example
├── .gitignore
├── package.json
└── server.js                       # entry point, starts the server
```

## Architecture Rationale

### Layered separation: routes → controllers → config

Each layer has exactly one job:

- **Routes** map an HTTP verb + path to a controller function. They don't contain logic — just define the API surface, so you can scan a routes file and see every endpoint for that resource at a glance.
- **Controllers** hold the actual business logic: querying the database, validating input, shaping responses. This is where most of the code lives.
- **Config** (the DB pool) is created once and imported everywhere it's needed, instead of every controller opening its own connection.

This separation means changes stay isolated — e.g. adding auth middleware or swapping the DB connection method touches one file, not a tangle of mixed logic spread across the app.

### One file per resource

The schema has 8 tables (learners, subjects, sessions, progress, invoices, invoice line items, payments, plus a balances view). Each gets its own route + controller pair so that:

- Changes to `invoices` can't accidentally break `learners` — they're physically separate files.
- Navigating the codebase mirrors how you think about the system ("fix invoice generation" → go straight to `invoices.controller.js`).

### `app.js` vs `server.js` split

`app.js` builds the Express app (middleware + routes) but never calls `.listen()`. `server.js` is the only file that starts the server.

This means the app can be imported directly into automated tests (e.g. Jest + Supertest) without needing a real network port open — useful once test coverage is added later.

### `mysql2` over `mysql`, and a connection pool

- `mysql2` supports native Promises, enabling clean `async/await` in controllers instead of nested callbacks.
- A **connection pool** (rather than a single connection) lets multiple simultaneous requests — e.g. two guardians checking balances at once — get handled concurrently, up to 10 connections by default, instead of queuing behind a single connection.

### `.env` for credentials

Azure host, username, and password are never hardcoded or committed to git. Anyone cloning the repo (e.g. from a public GitHub) would otherwise see live database credentials. `.env` + `.gitignore` keeps secrets local to each machine.

### `ssl: { rejectUnauthorized: false }` in `db.js`

Azure Database for MySQL Flexible Server enforces TLS/SSL on all connections by default. Without this option, Node's MySQL driver refuses to connect at all, since it won't trust the certificate chain without either this flag or a fully configured CA certificate.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Azure MySQL credentials:
   ```
   DB_HOST=tutoring-tracker-karabo.mysql.database.azure.com
   DB_USER=ktmoreti
   DB_PASSWORD=your_password_here
   DB_NAME=tutoring_tracker
   DB_PORT=3306
   PORT=5000
   ```

3. Run the server:
   ```bash
   npm run dev
   ```

## Database

Schema lives on Azure Database for MySQL (Flexible Server, South Africa North region). Core tables:

- `learners`, `subjects`, `learner_subjects` — learner records and enrollments
- `sessions` — logged tutoring sessions (drives attendance)
- `progress_records` — grades/assessment tracking
- `invoices`, `invoice_line_items` — formal billing, generated from sessions
- `payments` — money received, allocated against an invoice
- `learner_balances` (view) — computed outstanding balance per learner
