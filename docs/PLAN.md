# ResearchHub — Deployment PLAN

Local Kubernetes first. Production / CI-CD only after local k8s works.

Stack: Django + React (client-ui + admin-ui) + PostgreSQL + Docker + Kubernetes

Branch: `test-k8s-local`

---

## NOW — Local Kubernetes — DONE

Goal achieved: same app runs on a local cluster before any cloud VPS.

```
Laptop
  │
  ▼
Local Kubernetes (Docker Desktop)
  │
  ├── Django Pod          ← LoadBalancer → localhost:8000
  ├── client-ui Pod       ← LoadBalancer → localhost:5173
  ├── admin-ui Pod        ← LoadBalancer → localhost:5175
  └── PostgreSQL Pod      ← ClusterIP (internal only)
```

**No local Ingress** — Docker Desktop LoadBalancer is enough for browser access.
Ingress + TLS stay for Phase B (production).

### What we have done

1. **Enable local Kubernetes** — DONE
   - Docker Desktop Kubernetes enabled
   - Context: `docker-desktop`
   - Verified: `kubectl get nodes` → Ready

2. **Production-style Docker images** — DONE
   - `backend/Dockerfile`
   - `client-ui/Dockerfile`
   - `admin-ui/Dockerfile`
   - Built/tagged for the cluster via `make k8s-build`
     (`researchhub-backend:local`, etc.)

3. **Fill `k8s/` manifests** — DONE

   Actual layout:

   ```text
   project/
   ├── backend/                 # Django
   ├── client-ui/               # React
   ├── admin-ui/                # React
   ├── docker/
   │   └── docker-compose.yml   # daily local (Compose)
   ├── Makefile                 # make k8s-* targets
   ├── k8s/
   │   ├── README.md            # how to run local k8s
   │   ├── sync-env.ps1         # .env → ConfigMap + Secret
   │   ├── namespace.yaml
   │   ├── configmap.example.yaml
   │   ├── secret.example.yaml
   │   ├── configmap.yaml       # generated from .env (gitignored)
   │   ├── secret.yaml          # generated from .env (gitignored)
   │   ├── postgres.yaml
   │   ├── backend.yaml         # Service type: LoadBalancer
   │   ├── client-ui.yaml       # Service type: LoadBalancer
   │   ├── admin-ui.yaml        # Service type: LoadBalancer
   │   └── (no ingress.yaml)   # optional locally — skipped on purpose
   └── .gitlab-ci.yml           # later — not now
   ```

4. **Deploy PostgreSQL** — DONE
   - Own Pod/Service + volume (not inside Django)
   - ClusterIP only (not exposed to the host)

   ```
   PostgreSQL
        ↑
        │
     Django
   ```

5. **Deploy backend + both UIs** — DONE
   - Config via ConfigMap / Secret from root `.env` (`make k8s-sync-env`)
   - Services: **LoadBalancer** → localhost ports (not NodePort / port-forward / Ingress)

6. **Smoke-test locally** — DONE
   - `make k8s-start` brings up the stack
   - App works in the browser:
     - Client UI → http://localhost:5173
     - Admin UI → http://localhost:5175
     - API → http://localhost:8000

7. **Make helpers + docs** — DONE

   | Target | Purpose |
   |--------|---------|
   | `make k8s-sync-env` | Build ConfigMap/Secret from root `.env` |
   | `make k8s-build` | Build local images for Docker Desktop K8s |
   | `make k8s-apply` | Sync `.env` then `kubectl apply` |
   | `make k8s-start` | One shot: build + sync + apply |
   | `make k8s-delete` | Delete `researchhub` namespace |
   | `make k8s-status` | Show pods and services |

   Docs: `k8s/README.md`

**Exit criteria met:** `make k8s-start` (build + sync + apply) brings up Postgres + backend + both UIs; app usable in the browser.

Re-bring up anytime:

```powershell
make down          # if Compose holds the same ports
make k8s-start
make k8s-status
```

---

## AFTER — Production (only when local k8s is solid)

Local k8s is solid. Do production in this order when you want it.

### 1. Choose where Kubernetes will run

You need a server / cloud provider first.

```
Cloud provider / VPS
        ↓
Kubernetes cluster
        ↓
Your application
```

**Provider examples (pick one; keep it simple for a personal / interview project):**

| Option | Example | Notes |
|--------|---------|--------|
| Simple VPS + k8s | Hetzner, Contabo, OVH, DigitalOcean Droplet | Install k3s or kubeadm yourself — enough for demos |
| Managed Kubernetes | DigitalOcean DOKS, Linode LKE, Scaleway Kapsule, Civo | Less ops; pay for control plane |
| Big cloud | AWS EKS, GCP GKE, Azure AKS | Overkill unless you want to show that skill |
| GitLab-friendly | Deploy to a VPS; images from GitLab Container Registry | Fits `.gitlab-ci.yml` later |

For a personal interview project: **one VPS + k3s** (or DOKS) is enough. You do not need AWS/GCP complexity unless you specifically want to demonstrate it.

### 2. Prepare the application for production

Repo already has most of this from Phase A. For production, add/adjust:

```text
project/
├── backend/                 # Django
├── client-ui/               # React
├── admin-ui/                # React
├── k8s/
│   ├── namespace.yaml
│   ├── backend.yaml         # likely ClusterIP behind Ingress (not LoadBalancer)
│   ├── client-ui.yaml
│   ├── admin-ui.yaml
│   ├── postgres.yaml        # or drop if using managed DB
│   ├── ingress.yaml         # NEW for production hostnames
│   └── secrets…             # never commit real secrets
└── .gitlab-ci.yml           # or GitHub Actions — later
```

Images: production Dockerfiles (already present); secrets only via env / K8s Secrets.

### 3. Build Docker images + push to a registry

Make sure both apps work as production containers:

```
React (client-ui / admin-ui) → Docker image
Django                       → Docker image
```

Then push to a container registry, for example:

| Registry | Example |
|----------|---------|
| GitLab Container Registry | `registry.gitlab.com/<group>/researchhub/backend:latest` |
| Docker Hub | `docker.io/<user>/researchhub-backend:latest` |
| GitHub Container Registry | `ghcr.io/<user>/researchhub-backend:latest` |
| Cloud registry | ECR / GCR / ACR if on that cloud |

```
Container Registry
        ↓
backend:latest
client-ui:latest
admin-ui:latest
```

(Local Phase A used local tags only — no registry push yet.)

### 4. Create the Kubernetes cluster (on the chosen provider)

```
Production Server / Cloud
        │
        ▼
 Kubernetes Cluster
        │
        ├── Django Pod
        ├── client-ui Pod
        ├── admin-ui Pod
        ├── PostgreSQL (or managed DB)
        └── Nginx Ingress
```

### 5. Deploy PostgreSQL (or managed DB)

Do **not** put the database inside the Django container.

```
PostgreSQL
     ↑
     │
  Django
```

In-cluster Postgres already proven locally. For serious production, you can use a **managed** PostgreSQL outside the cluster (e.g. DigitalOcean Managed DB, Supabase Postgres, Cloud SQL, RDS) and only point Django at it.

### 6. Configure the Ingress

This is where production Ingress starts (not done locally — we used LoadBalancer).

```
https://researchhub.example.com
             │
             ▼
          Ingress
        /    |    \
       /     |     \
 client-ui  admin  Django
                     │
                 PostgreSQL
```

Possible host split:

```
researchhub.example.com        → client-ui
admin.researchhub.example.com  → admin-ui
api.researchhub.example.com    → Django
```

(Exact hostnames via DNS + env / Ingress rules.)

### 7. Add HTTPS

Ingress + TLS, commonly **Let's Encrypt** via **cert-manager**.

```
Browser
   ↓ HTTPS
Ingress
   ↓
React / Django
```

### 8. Only after that — CI/CD

CI/CD does **not** host the app. It automates deploy to your cluster.

```
Developer
   │
   ▼
GitLab (or GitHub)
   │
   ├── Tests
   ├── Build Docker images
   ├── Push images
   └── Deploy to Kubernetes
              │
              ▼
       Production cluster
```

Example pipeline tools: GitLab CI (`.gitlab-ci.yml`), GitHub Actions, or a simple deploy job that runs `kubectl` / Helm against the cluster.

---

## Suggested work order (checklist)

**Phase A — Local k8s — DONE**

- [x] Enable Docker Desktop Kubernetes
- [x] Write `k8s/` manifests (namespace, postgres, backend, UIs, config/secret examples + sync)
- [x] Build local images (`make k8s-build`)
- [x] Apply stack (`make k8s-apply` / `make k8s-start`)
- [x] Expose UIs + API via **LoadBalancer** → localhost (no Ingress locally)
- [x] Smoke-test in browser (`make k8s-start` works)
- [x] Document helpers (`k8s/README.md`, Make `k8s-*` targets)

**Phase B — Production (next when you want)**

- [ ] Pick provider (VPS vs managed k8s) — see examples above
- [ ] Harden images + env for production
- [ ] Push images to a registry
- [ ] Create remote cluster
- [ ] Postgres (reuse in-cluster pattern or managed DB)
- [ ] Ingress + DNS (first time we need `ingress.yaml`)
- [ ] TLS (cert-manager / Let's Encrypt)
- [ ] CI/CD last

---

## Rule of thumb

```
Compose (daily)  →  Local k8s (DONE)  →  Remote k8s  →  CI/CD
```

Do not start GitLab CI deploy jobs before remote Kubernetes is chosen and Ingress/TLS are planned.
