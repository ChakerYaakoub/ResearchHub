# ResearchHub

**Simplified Scientific Proposal & Experiment Management**

## Scientific Project & Experiment Platform

<p align="center">
  <img src="https://img.shields.io/badge/Project-ResearchHub-B82721" alt="ResearchHub" />
  <img src="https://img.shields.io/badge/License-TBD-lightgrey" alt="License" />
  <img src="https://img.shields.io/badge/Client-React%20Vite%20TypeScript-61DAFB" alt="Client UI" />
  <img src="https://img.shields.io/badge/Admin-React%20Vite-61DAFB" alt="Admin UI" />
  <img src="https://img.shields.io/badge/API-Django%20DRF-092E20" alt="Django" />
  <img src="https://img.shields.io/badge/Auth-JWT-black" alt="JWT" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Email-Django%20SMTP-3776AB" alt="Email" />
  <img src="https://img.shields.io/badge/K8s-Docker%20Desktop-326CE5" alt="Kubernetes" />
  <img src="https://img.shields.io/badge/Infra-Docker%20Compose-2496ED" alt="Docker" />
</p>

**ResearchHub** is a simplified platform for managing scientific research projects end to end — inspired by synchrotron-style proposal workflows, without cloning a full facility information system.

**client-ui** — researchers can:

- create projects and submit proposals
- go through scientific review
- schedule experiments and link publications
- invite collaborators (email + in-app)

**admin-ui** — platform admins can:

- approve or reject proposals
- manage users, facilities, and catalog data
- oversee projects, publications, and invitations

**Live:** _Coming soon_

---

## Demo video

▶ _Coming soon_

---

## Project article

📝 _Coming soon_

Full write-up on my portfolio: architecture, stack, and what the platform does.

---

## Product preview

Screenshots will be added under [`docs/screenshots/`](docs/screenshots/) (desktop + mobile).

### Desktop

<p align="center"><strong>Client — public / dashboard</strong></p>
<p align="center">
  <em>docs/screenshots/client-1.png — coming soon</em>
</p>

<br/>

<p align="center"><strong>Admin — overview</strong></p>
<p align="center">
  <em>docs/screenshots/admin-1.png — coming soon</em>
</p>

<br/>

### Mobile

<br/>

<div align="center">

| Client UI | Admin UI |
| --------- | -------- |
| _phone-client.png — coming soon_ | _phone-admin.png — coming soon_ |

</div>

<br/>

---

## Workflow

```text
Create Project
      ↓
Submit Proposal
      ↓
Scientific Review
      ↓
Approved / Rejected
      ↓
Experiment
      ↓
Publication
```

---

## Architecture (current)

What runs **today**: local Kubernetes on Docker Desktop, and Docker Compose for everyday coding. No cloud Ingress / nginx in this repo yet.

### Local Kubernetes (Docker Desktop)

Cluster demo on your machine. Same apps; ConfigMap/Secret generated from root `.env`.

```mermaid
flowchart TB
  Browser["Browser · localhost"]

  subgraph K8s["Docker Desktop Kubernetes · ns researchhub"]
    CUI["client-ui · LoadBalancer :5173"]
    AUI["admin-ui · LoadBalancer :5175"]
    API["backend · LoadBalancer :8000"]
    PG[("postgres · ClusterIP + PVC")]
  end

  Browser --> CUI
  Browser --> AUI
  Browser --> API
  CUI --> API
  AUI --> API
  API --> PG
```

<br/>

<div align="center">

| Service     | Role                                      | Port (default)        |
| ----------- | ----------------------------------------- | --------------------- |
| `client-ui` | Researcher SPA (marketing + dashboard)    | 5173                  |
| `admin-ui`  | Platform admin SPA                        | 5175                  |
| `backend`   | Django REST API + JWT + mailer            | 8000                  |
| `postgres`  | Primary database                          | 5432 (k8s / Compose)  |

</div>

<br/>

- **No local Ingress** — Docker Desktop LoadBalancer maps services to localhost.
- Postgres keeps data on a PVC until you wipe the namespace (`make k8s-delete`).
- Pause without losing DB: `make k8s-stop` · resume: `make k8s-resume`.

Details: [`k8s/README.md`](k8s/README.md) · deploy plan notes: [`docs/PLAN.md`](docs/PLAN.md)

### Docker Compose (daily)

Same stack for day-to-day development (bind mounts, hot reload).

```mermaid
flowchart TB
  Researcher["Researcher"]
  Admin["Platform admin"]

  subgraph Compose["Docker Compose"]
    CUI["client-ui · React Vite<br/>:5173"]
    AUI["admin-ui · React Vite<br/>:5175"]
    API["backend · Django DRF · JWT<br/>:8000"]
    PG[("PostgreSQL")]
  end

  Researcher --> CUI
  Admin --> AUI
  CUI -->|"REST + JWT rh_*"| API
  AUI -->|"REST + JWT rh_admin_*"| API
  AUI -.->|"Origin ∈ ADMIN_UI_ORIGINS"| API
  API --> PG
  API -.->|"Django email / SMTP"| Mail["SMTP"]
```

<br/>

Compose file: [`docker/docker-compose.yml`](docker/docker-compose.yml) · env: root [`.env.example`](.env.example)

---

## How it works

### Authentication

```mermaid
sequenceDiagram
  actor User
  participant FE as client-ui / admin-ui
  participant API as Django DRF

  User->>FE: Login / register
  FE->>API: POST /api/auth/login/ or register/
  API->>FE: access + refresh + user
  FE->>API: Authorization Bearer access
  API->>API: JWT auth + DRF permissions + IDOR filters
  API->>FE: JSON response
```

<br/>

<div align="center">

| Layer | Roles |
| ----- | ----- |
| **Platform** | `SUPER_ADMIN` · `ADMIN` · `RESEARCHER` |
| **Project** | `OWNER` · `EDITOR` · `VIEWER` |

</div>

<br/>

- JWT = authentication only (`djangorestframework-simplejwt`).
- Tokens are **per UI origin** (`rh_*` on client-ui · `rh_admin_*` on admin-ui).
- `/api/admin/*` and proposal approve/reject require platform **ADMIN** (or SUPER_ADMIN) **and** `Origin` ∈ `ADMIN_UI_ORIGINS`.

### API surface (high level)

<br/>

<div align="center">

| Area | Path | Notes |
| ---- | ---- | ----- |
| Auth | `/api/auth/*` | register · login · refresh · logout · me |
| Projects & nested | `/api/projects/…` | proposals · experiments · publications · invitations |
| Admin panel | `/api/admin/*` | users · facilities · review tools · Origin check |
| Review | `/api/proposals/{id}/approve|reject/` | admin-ui Origin + platform ADMIN |

</div>

<br/>

Full reference: [`backend/docs/API.md`](backend/docs/API.md)

---

## Roles

Two separate role systems. Backend enforces both; UI gates are UX only.

### Platform roles

<br/>

<div align="center">

| Role | App | Can do |
| ---- | --- | ------ |
| `SUPER_ADMIN` | admin-ui | Everything `ADMIN` can + manage admins (`/admins`: list / create / deactivate platform `ADMIN` accounts) |
| `ADMIN` | admin-ui | Stats · researchers · projects overview · proposal approve/reject · facilities CRUD · publications (read) · invitations — **not** the Admins page |
| `RESEARCHER` | client-ui | Register / login · own projects & collaboration — **cannot** use admin-ui |

</div>

<br/>

Admin API calls still require `Origin` ∈ `ADMIN_UI_ORIGINS` (admin-ui origin).

### Project roles (client-ui)

<br/>

<div align="center">

| Role | Read | Edit project / proposal / experiments / publications | Invite / remove collaborators | Soft-delete project |
| ---- | ---- | ---------------------------------------------------- | ----------------------------- | ------------------- |
| `VIEWER` | Yes | No | No | No |
| `EDITOR` | Yes | Yes | No | No |
| `OWNER` | Yes | Yes | Yes | Yes |

</div>

<br/>

Platform `ADMIN` / `SUPER_ADMIN` bypass project membership for access. Proposal **approve / reject** remains admin-only (+ Origin).

More: [`backend/docs/AUTHORIZATION.md`](backend/docs/AUTHORIZATION.md)

---

## Lifecycles

Statuses below match backend enums (invalid transitions are rejected by the API).

### Project

All statuses: `DRAFT` · `SUBMITTED` · `UNDER_REVIEW` · `APPROVED` · `REJECTED` · `RESUBMITTED` · `IN_PROGRESS` · `COMPLETED` · `SOFT_DELETED`

```mermaid
flowchart LR
  DRAFT --> SUBMITTED --> UNDER_REVIEW
  UNDER_REVIEW --> APPROVED
  UNDER_REVIEW --> REJECTED
  REJECTED --> RESUBMITTED --> UNDER_REVIEW
  APPROVED --> IN_PROGRESS --> COMPLETED
```

`SOFT_DELETED` is a soft-delete path (owner or platform admin); hidden from normal researcher lists.

### Proposal

One proposal per project (MVP). Reviewed from admin-ui.

```mermaid
flowchart LR
  PENDING --> APPROVED
  PENDING --> REJECTED
```

### Experiment

- **Kind:** `PLANNED` · `EXECUTED`
- **Status:** `PLANNED` → `SCHEDULED` → `COMPLETED` / `CANCELLED`

```mermaid
flowchart LR
  PLANNED --> SCHEDULED
  SCHEDULED --> COMPLETED
  SCHEDULED --> CANCELLED
```

### Invitation

Invite role offered: `EDITOR` or `VIEWER`. Token expires in **7 days**. Membership is created **only on accept**.

```mermaid
flowchart LR
  PENDING --> ACCEPTED
  PENDING --> DECLINED
  PENDING --> EXPIRED
```

Publications are linked to projects (catalog kinds); no separate public status machine in the MVP.

---

## Security

- Authentication and authorization enforced on the **backend** — frontends are never trusted
- Project access limited to owners, collaborators, and platform admins (IDOR-safe querysets)
- Admin API routes require admin-ui Origin (`ADMIN_UI_ORIGINS`) plus platform ADMIN role
- Invitation tokens are cryptographically secure, expire in **7 days**, and only grant access after acceptance (email must match)
- Secrets live in root `.env` and generated `k8s/secret.yaml` (gitignored) — never commit real credentials

More: [`backend/docs/SECURITY.md`](backend/docs/SECURITY.md)

---

## Deployment plan (brief)

**Today:** local Kubernetes + Docker Compose work on your machine.

**Later (production)** — order matters; CI/CD last:

1. Choose where Kubernetes runs (e.g. VPS + k3s, or managed k8s)
2. Push Docker images to a container registry
3. Create the remote cluster · Postgres in-cluster or managed
4. Ingress + DNS + HTTPS (Let's Encrypt / cert-manager)
5. Automate with CI/CD

Full checklist: [`docs/PLAN.md`](docs/PLAN.md)

---

## Project structure

```text
ResearchHub/
├── backend/           # Django + DRF + JWT + docs
├── client-ui/         # Researcher SPA (Vite) + docs
├── admin-ui/          # Platform admin SPA (Vite) + docs
├── k8s/               # Local Docker Desktop Kubernetes manifests
├── docker/
│   └── docker-compose.yml
├── docs/
│   └── PLAN.md        # Local k8s done · production deploy plan
├── Makefile           # k8s + Compose helpers
├── .env.example
└── README.md
```

Package details: [`backend/README.md`](backend/README.md) · [`client-ui/README.md`](client-ui/README.md) · [`admin-ui/README.md`](admin-ui/README.md) · [`k8s/README.md`](k8s/README.md)

---

## Quick start

**Prerequisites:** [Docker Desktop](https://docs.docker.com/desktop/) (Kubernetes enabled + Compose v2) · Make · `kubectl`

**1. Env**

```powershell
cp .env.example .env
```

### Local Kubernetes

**2. Start**

```powershell
make k8s-start
```

**3. Open**

<br/>

<div align="center">

| URL | Service |
| --- | ------- |
| http://localhost:5173 | Client UI |
| http://localhost:5175 | Admin UI |
| http://localhost:8000/api | Backend API |

</div>

<br/>

**4. Super admin**

```powershell
make k8s-createsuperuser
```

Then sign in on **admin-ui** (http://localhost:5175).

**5. Stop / resume / wipe**

```powershell
make k8s-status
make k8s-stop          # pause pods — keeps DB
make k8s-resume
make k8s-delete        # DESTROYS namespace + DB volume
```

### Docker Compose (daily)

Use Compose for everyday coding (hot reload). Stop k8s first if the same ports are in use (`make k8s-stop` or `make k8s-delete`).

```powershell
make start
make createsuperuser
make stop
make logs
make status
```

Volumes keep data after `make stop`. Wipe DB with `make clean` (`down -v`).

---

## Objective

Demonstrate a secure full-stack scientific project platform: dual React apps, Django REST with real AuthZ/IDOR protection, a working local Kubernetes deployment path, and Docker Compose for day-to-day development.

---

## Planned (not implemented)

- Cloud cluster · Ingress · HTTPS
- Container registry + CI/CD pipeline
- Optional real cloud deploy

See [`docs/PLAN.md`](docs/PLAN.md).

---

## License & copyright

Copyright (c) 2026 Chaker Yaakoub.

License to be defined (this project is **not** private / proprietary).

### Author

**Chaker Yaakoub**

- Portfolio: <a href="https://yaakoub-chaker-bteit.web.app/" target="_blank" rel="noopener noreferrer">yaakoub-chaker-bteit.web.app</a>
- LinkedIn: <a href="https://www.linkedin.com/in/chaker-yaakoub/" target="_blank" rel="noopener noreferrer">chaker-yaakoub</a>
- GitHub: <a href="https://github.com/ChakerYaakoub/" target="_blank" rel="noopener noreferrer">ChakerYaakoub</a>
