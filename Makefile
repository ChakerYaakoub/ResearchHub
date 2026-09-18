# ResearchHub — Make helpers
# Requires: Docker + Docker Compose. Optional: GNU Make (or run docker compose yourself).
# Kubernetes targets need Docker Desktop Kubernetes + kubectl.
#
# Compose file lives in docker/; --project-directory . = repo root (.env + build contexts).
# Docs: docker/README.md · k8s/README.md · root README.md

COMPOSE ?= docker compose -f docker/docker-compose.yml --project-directory .
POWERSHELL ?= powershell

.PHONY: help start up stop down build rebuild restart logs ps status \
	shell-backend shell-client-ui shell-admin-ui \
	migrate createsuperuser seed-demo clear-demo test-backend test-client-ui test-admin-ui test-frontend clean \
	k8s-sync-env k8s-build k8s-apply k8s-start k8s-stop k8s-resume \
	k8s-delete k8s-status k8s-createsuperuser k8s-seed-demo k8s-clear-demo

# ---------------------------------------------------------------------------
# help — list every target (default when you run `make` with no args if set as .DEFAULT)
# ---------------------------------------------------------------------------
help:
	@echo ResearchHub make targets:
	@echo   make start            Start stack detached (build if needed)
	@echo   make stop             Stop containers (keep volumes)
	@echo   make down             Stop and remove containers
	@echo   make build            Build images
	@echo   make rebuild          Rebuild images without cache, then start
	@echo   make restart          Restart all services
	@echo   make logs             Follow logs (all services)
	@echo   make ps               Show container status
	@echo   make shell-backend    Shell into backend container
	@echo   make shell-client-ui  Shell into client-ui container
	@echo   make shell-admin-ui   Shell into admin-ui container
	@echo   make migrate          Run Django migrations
	@echo   make createsuperuser  Create Django superuser
	@echo   make seed-demo        Load demo users/projects/invitations (Compose)
	@echo   make clear-demo       Delete demo seed data (Compose)
	@echo   make test-backend     Run Django tests
	@echo   make test-client-ui   Run client-ui Vitest suite
	@echo   make test-admin-ui    Run admin-ui Vitest suite
	@echo   make test-frontend    Run both UI Vitest suites
	@echo   make clean            Down + remove volumes (DESTROYS DB DATA)
	@echo   make k8s-sync-env     Build k8s ConfigMap/Secret from root .env
	@echo   make k8s-build        Build local images for Docker Desktop Kubernetes
	@echo   make k8s-apply        Sync .env then apply k8s manifests
	@echo   make k8s-start        One shot: build images + sync .env + apply
	@echo   make k8s-stop         Scale pods to 0 (keeps DB volume)
	@echo   make k8s-resume       Scale pods back to 1
	@echo   make k8s-delete       Delete researchhub namespace (DESTROYS DB DATA)
	@echo   make k8s-status       Show k8s pods and services
	@echo   make k8s-createsuperuser  Create SUPER_ADMIN in k8s backend pod
	@echo   make k8s-seed-demo    Load demo users/projects/invitations (k8s)
	@echo   make k8s-clear-demo   Delete demo seed data (k8s)

# ===========================================================================
# Docker Compose (daily development) — see docker/README.md
# ===========================================================================

# start / up — build if needed and run the full stack in the background
start up:
	$(COMPOSE) up --build -d

# stop — pause containers; named volumes (postgres, node_modules) stay
stop:
	$(COMPOSE) stop

# down — remove containers and networks; volumes kept (DB data survives)
down:
	$(COMPOSE) down

# build — build service images without starting containers
build:
	$(COMPOSE) build

# rebuild — force no-cache image rebuild, then start detached
rebuild:
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d

# restart — restart all running Compose services
restart:
	$(COMPOSE) restart

# logs — stream logs from every service (Ctrl+C to quit)
logs:
	$(COMPOSE) logs -f

# ps / status — show Compose container status
ps status:
	$(COMPOSE) ps

# shell-* — interactive shell inside a running service container
shell-backend:
	$(COMPOSE) exec backend sh

shell-client-ui:
	$(COMPOSE) exec client-ui sh

shell-admin-ui:
	$(COMPOSE) exec admin-ui sh

# migrate — apply Django DB migrations inside the backend container
migrate:
	$(COMPOSE) exec backend python manage.py migrate

# createsuperuser — interactive Django SUPER_ADMIN (Compose backend)
createsuperuser:
	$(COMPOSE) exec backend python manage.py createsuperuser

# seed-demo — demo users, facilities, project graph, pending invitation (Compose)
seed-demo:
	$(COMPOSE) exec backend python manage.py seed_demo

# clear-demo — remove demo seed data only (Compose); then re-run seed-demo
clear-demo:
	$(COMPOSE) exec backend python manage.py clear_demo

# test-backend — run Django test suite in the backend container
test-backend:
	$(COMPOSE) exec backend python manage.py test

# test-client-ui / test-admin-ui — Vitest inside each UI container
test-client-ui:
	$(COMPOSE) exec client-ui npm test

test-admin-ui:
	$(COMPOSE) exec admin-ui npm test

# test-frontend — run both UI Vitest suites
test-frontend: test-client-ui test-admin-ui

# clean — down + delete volumes (DESTROYS postgres data and node_modules volumes)
clean:
	$(COMPOSE) down -v

# ===========================================================================
# Docker Desktop Kubernetes — see k8s/README.md
# ConfigMap + Secret are generated from root .env (same source of truth as Compose).
# Free ports 5173/5175/8000 first if Compose is using them (`make down`).
# ===========================================================================

# k8s-sync-env — root .env → k8s/configmap.yaml + k8s/secret.yaml (gitignored)
k8s-sync-env:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File k8s/sync-env.ps1

# k8s-build — build local tags researchhub-*:local for Docker Desktop to pull
k8s-build:
	docker build -t researchhub-backend:local ./backend
	docker build -t researchhub-client-ui:local ./client-ui
	docker build -t researchhub-admin-ui:local ./admin-ui

# k8s-apply — sync .env, then apply namespace, config, secret, and all workloads
k8s-apply: k8s-sync-env
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secret.yaml
	kubectl apply -f k8s/postgres.yaml
	kubectl apply -f k8s/backend.yaml
	kubectl apply -f k8s/client-ui.yaml
	kubectl apply -f k8s/admin-ui.yaml

# k8s-start — one shot: build images + sync env + apply + show pods/services
k8s-start: k8s-build k8s-apply
	kubectl get pods,svc -n researchhub

# k8s-stop — scale all deployments to 0 (pause CPU); namespace + postgres PVC kept
k8s-stop:
	kubectl scale deployment/postgres deployment/backend deployment/client-ui deployment/admin-ui \
		-n researchhub --replicas=0

# k8s-resume — scale deployments back to 1 and show status
k8s-resume:
	kubectl scale deployment/postgres deployment/backend deployment/client-ui deployment/admin-ui \
		-n researchhub --replicas=1
	kubectl get pods,svc -n researchhub

# k8s-delete — delete namespace researchhub (DESTROYS PVC / DB data)
k8s-delete:
	kubectl delete namespace researchhub --ignore-not-found

# k8s-status — list pods and services in the researchhub namespace
k8s-status:
	kubectl get pods,svc -n researchhub

# k8s-createsuperuser — interactive SUPER_ADMIN inside the k8s backend pod
k8s-createsuperuser:
	kubectl exec -it -n researchhub deploy/backend -- python manage.py createsuperuser

# k8s-seed-demo — demo users, facilities, project graph, pending invitation (k8s)
k8s-seed-demo:
	kubectl exec -it -n researchhub deploy/backend -- python manage.py seed_demo

# k8s-clear-demo — remove demo seed data only (k8s); then re-run k8s-seed-demo
k8s-clear-demo:
	kubectl exec -it -n researchhub deploy/backend -- python manage.py clear_demo
