# Local Kubernetes (Docker Desktop)

Run ResearchHub on **Docker Desktop Kubernetes**. Daily development stays on Docker Compose (`make start`).

## Env (same as Docker Compose)

Root **`.env`** is the source of truth for both Compose and k8s.

| Command             | What happens                                                |
| ------------------- | ----------------------------------------------------------- |
| `make start`        | Compose loads `.env`                                        |
| `make k8s-sync-env` | Builds `k8s/configmap.yaml` + `k8s/secret.yaml` from `.env` |
| `make k8s-apply`    | Runs sync, then `kubectl apply`                             |

`configmap.yaml` and `secret.yaml` are **gitignored** (generated). Committed templates: `configmap.example.yaml`, `secret.example.yaml`.

## Prerequisites

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
2. **Settings → Kubernetes → Enable Kubernetes** (Kubeadm) → Apply & restart.
3. Confirm:

```powershell
kubectl config current-context
# expect: docker-desktop

kubectl get nodes
# expect: one node Ready
```

4. Root `.env` exists (`copy .env.example .env` if needed).
5. Stop Compose if the same ports are in use (`make down`).

## Build images and apply

One command (build + sync `.env` + apply):

```powershell
make down
make k8s-start
```

(`make down` only if Compose is using the same ports.)

Or step by step:

```powershell
make k8s-build
make k8s-apply
make k8s-status
```

## URLs

| Service    | URL                       |
| ---------- | ------------------------- |
| Client UI  | http://localhost:5173     |
| Admin UI   | http://localhost:5175     |
| API        | http://localhost:8000     |
| API prefix | http://localhost:8000/api |

Create an admin user (after backend is Ready):

```powershell
make k8s-createsuperuser
```

## Useful commands

```powershell
make k8s-sync-env
make k8s-status
make k8s-stop          # pause pods — keeps DB data
make k8s-resume        # bring pods back
kubectl logs -n researchhub deploy/backend -f
kubectl rollout restart deployment/backend -n researchhub
make k8s-delete        # DESTROYS namespace + DB volume
```

After changing `.env`, re-apply so pods pick up new ConfigMap/Secret:

```powershell
make k8s-apply
kubectl rollout restart deployment/backend deployment/client-ui deployment/admin-ui -n researchhub
```

After rebuilding images:

```powershell
make k8s-build
kubectl rollout restart deployment/backend deployment/client-ui deployment/admin-ui -n researchhub
```

## Smoke checklist

- [ ] `kubectl get pods -n researchhub` — all Running / Ready
- [ ] Client UI loads on http://localhost:5173
- [ ] Admin UI loads on http://localhost:5175
- [ ] API responds on http://localhost:8000/api/
- [ ] Login works; admin routes require Origin `http://localhost:5175`

## Troubleshooting

| Symptom                | Fix                                                            |
| ---------------------- | -------------------------------------------------------------- |
| `Missing .env` on sync | `copy .env.example .env` and edit                              |
| `ImagePullBackOff`     | `make k8s-build`; tags `researchhub-*:local`                   |
| Port already allocated | `make down` (Compose)                                          |
| Backend DB errors      | Wait for postgres Ready; check logs                            |
| CORS / admin Origin    | Fix origins in `.env`, then `make k8s-apply` + rollout restart |
| Wrong kubectl context  | `kubectl config use-context docker-desktop`                    |

## Layout

```text
k8s/
  sync-env.ps1              # .env → configmap.yaml + secret.yaml
  configmap.example.yaml    # committed template
  secret.example.yaml       # committed template
  configmap.yaml            # generated (gitignored)
  secret.yaml               # generated (gitignored)
  namespace.yaml
  postgres.yaml
  backend.yaml
  client-ui.yaml
  admin-ui.yaml
  README.md
```

## Cloud deploy

Not covered here. A later guide under `deploy/` will describe CI/CD, env, VM, registry, and HTTPS.
