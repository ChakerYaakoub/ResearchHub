# Local Kubernetes (Docker Desktop)

Run the same ResearchHub apps on **Docker Desktop Kubernetes** (namespace `researchhub`).  
Daily coding still prefers Docker Compose (`make start`) — see [`../docker/README.md`](../docker/README.md).

No Ingress / nginx here. UIs and API are exposed with **LoadBalancer** services that Docker Desktop maps to localhost.

## Make targets (overview)

| Target | What it does |
| ------ | ------------ |
| `make k8s-sync-env` | Root `.env` → `k8s/configmap.yaml` + `k8s/secret.yaml` |
| `make k8s-build` | Build `researchhub-*:local` images (backend, client-ui, admin-ui) |
| `make k8s-apply` | Sync env, then `kubectl apply` all manifests |
| `make k8s-start` | **One shot:** build + sync + apply · then `get pods,svc` |
| `make k8s-status` | Show pods and services in `researchhub` |
| `make k8s-stop` | Scale all deployments to **0** (keeps namespace + PVC) |
| `make k8s-resume` | Scale deployments back to **1** |
| `make k8s-delete` | Delete namespace `researchhub` (**DESTROYS DB PVC**) |
| `make k8s-createsuperuser` | `createsuperuser` inside `deploy/backend` |
| `make k8s-seed-demo` | Demo users/projects/invitations inside `deploy/backend` |

## Prerequisites

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) with **Settings → Kubernetes → Enable Kubernetes** (Kubeadm).
2. `kubectl` on PATH · context `docker-desktop`.
3. Root `.env` exists (`copy .env.example .env`).
4. Free ports **5173 / 5175 / 8000** — stop Compose if needed: `make down`.

```powershell
kubectl config current-context   # expect: docker-desktop
kubectl get nodes                # expect: one Ready node
```

## Quick start

```powershell
make down          # only if Compose holds the same ports
make k8s-start
make k8s-status
make k8s-createsuperuser
make k8s-seed-demo
```

| URL | Service |
| --- | ------- |
| http://localhost:5173 | client-ui |
| http://localhost:5175 | admin-ui |
| http://localhost:8000 | backend |
| http://localhost:8000/api | API prefix |

Step by step (same as `k8s-start`):

```powershell
make k8s-build
make k8s-apply
make k8s-status
```

## Architecture

| Workload | Service type | Port | Image / notes |
| -------- | ------------ | ---- | ------------- |
| `client-ui` | LoadBalancer | 5173 | `researchhub-client-ui:local` |
| `admin-ui` | LoadBalancer | 5175 | `researchhub-admin-ui:local` |
| `backend` | LoadBalancer | 8000 | `researchhub-backend:local` · waits for postgres via initContainer |
| `postgres` | ClusterIP (internal) | 5432 | `postgres:16-alpine` + PVC `postgres-data` (1Gi) |

Also applied: ConfigMap `researchhub-config` · Secret `researchhub-secret` (from `.env`).

App auth is the same as Compose (JWT, Origin ∈ `ADMIN_UI_ORIGINS`, etc.). SPA calls go **browser → backend** via `VITE_API_BASE_URL` (usually `http://localhost:8000/api`).

## Env (same source as Compose)

Root **`.env`** is the source of truth.

| Command | Effect |
| ------- | ------ |
| `make start` | Compose loads `.env` directly |
| `make k8s-sync-env` | Writes generated ConfigMap + Secret |
| `make k8s-apply` | Sync, then apply (includes ConfigMap/Secret) |

- Generated: `configmap.yaml`, `secret.yaml` (**gitignored**).
- Templates: `configmap.example.yaml`, `secret.example.yaml` (committed).
- Sync also appends `backend` to `ALLOWED_HOSTS` for in-cluster DNS.
- Secrets synced: `SECRET_KEY`, `DATABASE_PASSWORD`, `EMAIL_HOST_*`.
- After editing `.env`: `make k8s-apply` then restart deployments (see below).

Never commit real `secret.yaml` / credentials.

## Images

```powershell
make k8s-build
# docker build -t researchhub-backend:local ./backend
# docker build -t researchhub-client-ui:local ./client-ui
# docker build -t researchhub-admin-ui:local ./admin-ui
```

`imagePullPolicy: IfNotPresent` — Docker Desktop uses local tags. After a rebuild:

```powershell
make k8s-build
kubectl rollout restart deployment/backend deployment/client-ui deployment/admin-ui -n researchhub
```

## Lifecycle

| Goal | Command | Data |
| ---- | ------- | ---- |
| Pause (free CPU) | `make k8s-stop` | PVC kept |
| Resume | `make k8s-resume` | same DB |
| Full wipe | `make k8s-delete` | namespace + PVC gone |

```powershell
make k8s-stop
make k8s-resume
make k8s-delete    # destructive
```

## Day-to-day ops

```powershell
make k8s-status
make k8s-sync-env
kubectl logs -n researchhub deploy/backend -f
kubectl logs -n researchhub deploy/client-ui -f
kubectl exec -it -n researchhub deploy/backend -- python manage.py migrate
make k8s-createsuperuser
make k8s-seed-demo
```

After `.env` changes:

```powershell
make k8s-apply
kubectl rollout restart deployment/backend deployment/client-ui deployment/admin-ui -n researchhub
```

Compose vs k8s: do not run both on the same host ports. Use `make down` before `make k8s-start`, or `make k8s-stop` / `make k8s-delete` before `make start`.

## Smoke checklist

- [ ] `kubectl get pods -n researchhub` — all Running / Ready
- [ ] Client UI → http://localhost:5173
- [ ] Admin UI → http://localhost:5175
- [ ] API → http://localhost:8000/api/
- [ ] Login works; admin routes need Origin `http://localhost:5175`

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `Missing .env` on sync | `copy .env.example .env` and edit |
| `ImagePullBackOff` | `make k8s-build` (tags `researchhub-*:local`) |
| Port already allocated | `make down` (Compose) or free the port |
| Backend DB errors | Wait for postgres Ready; `kubectl logs -n researchhub deploy/backend` |
| CORS / admin Origin | Fix origins in `.env` → `make k8s-apply` + rollout restart |
| Wrong kubectl context | `kubectl config use-context docker-desktop` |
| Stale ConfigMap/Secret | `make k8s-sync-env` then `make k8s-apply` + restart |
| Pods stuck after stop | `make k8s-resume` or check `kubectl get deploy -n researchhub` |

## Layout

```text
k8s/
  sync-env.ps1              # .env → configmap.yaml + secret.yaml
  configmap.example.yaml    # committed template
  secret.example.yaml       # committed template
  configmap.yaml            # generated (gitignored)
  secret.yaml               # generated (gitignored)
  namespace.yaml
  postgres.yaml             # Deployment + ClusterIP Service + PVC
  backend.yaml              # Deployment + LoadBalancer :8000
  client-ui.yaml            # Deployment + LoadBalancer :5173
  admin-ui.yaml             # Deployment + LoadBalancer :5175
  README.md
```

## Related

- Docker Compose (daily): [`../docker/README.md`](../docker/README.md)
- Root overview: [`../README.md`](../README.md)
- Production deploy (planned): [`../docs/PLAN.md`](../docs/PLAN.md)
- App READMEs: [`../backend/README.md`](../backend/README.md) · [`../client-ui/README.md`](../client-ui/README.md) · [`../admin-ui/README.md`](../admin-ui/README.md)

## Cloud deploy

Not covered here. Production (remote cluster, Ingress, HTTPS, registry, CI/CD) is **planned** — see [`../docs/PLAN.md`](../docs/PLAN.md).
