# ResearchHub — Deployment PLAN

Future **production / remote** deploy plan. Local Compose + Kubernetes already work.

```text
Compose (daily)  →  Local k8s (done)  →  Remote k8s  →  CI/CD
```

---

## Already in the project

- **Docker Compose** — day-to-day (`make start`) → [`docker/README.md`](../docker/README.md)
- **Local Kubernetes** (Docker Desktop) — `make k8s-start` / stop / resume / delete; `.env` → ConfigMap + Secret → [`k8s/README.md`](../k8s/README.md)
- Same apps: postgres (ClusterIP + PVC), backend / client-ui / admin-ui (LoadBalancer → localhost)
- **No** local Ingress or TLS (not needed for Docker Desktop LoadBalancer)

---

## Planned — production

Do this only when you want a public/remote deploy. Order matters; **CI/CD last**.

### 1. Choose where Kubernetes runs

| Option | Example | Notes |
|--------|---------|--------|
| VPS + k8s | Hetzner, Contabo, OVH, DO Droplet + k3s | Simple for demos |
| Managed k8s | DOKS, LKE, Scaleway, Civo | Less ops |
| Big cloud | EKS / GKE / AKS | Only if you want that skill |

Personal / interview project: **one VPS + k3s** (or DOKS) is enough.

### 2. Harden for production

- Production env (`DEBUG=False`, secrets, CORS / `ADMIN_UI_ORIGINS` / CSRF for real origins)
- Services likely **ClusterIP** behind Ingress (not LoadBalancer like local)

### 3. Push images to a registry

Build and push `backend`, `client-ui`, `admin-ui` (GitLab / Docker Hub / GHCR / cloud registry). Local phase used `researchhub-*:local` only.

### 4. Create the remote cluster

Install or provision the cluster on the chosen provider.

### 5. Postgres

In-cluster (same pattern as local) **or** managed DB outside the cluster. Never embed the DB in the Django image.

### 6. Ingress + DNS

First time we need `ingress.yaml`, e.g.:

```text
researchhub.example.com        → client-ui
admin.researchhub.example.com  → admin-ui
api.researchhub.example.com    → backend
```

### 7. HTTPS

Ingress + TLS — typically **cert-manager** + **Let's Encrypt**.

### 8. CI/CD (last)

Automate test → build → push → deploy (`kubectl` / Helm). Does not replace having a cluster + Ingress/TLS planned first.

---

## Checklist

**Local — done**

- [x] Compose daily + local Docker Desktop Kubernetes
- [x] Manifests, env sync, LoadBalancer → localhost, smoke-test
- [x] Docs: `k8s/README.md`, `docker/README.md`, Make `k8s-*`

**Production — planned**

- [ ] Pick provider (VPS + k3s or managed k8s)
- [ ] Harden images + env for production
- [ ] Push images to a registry
- [ ] Create remote cluster
- [ ] Postgres (in-cluster or managed)
- [ ] Ingress + DNS
- [ ] TLS (cert-manager / Let's Encrypt)
- [ ] CI/CD last
