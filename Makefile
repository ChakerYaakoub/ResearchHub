# ResearchHub — Docker Compose helpers
# Requires: Docker + Docker Compose. Optional: GNU Make (or use docker compose directly).
# Kubernetes targets need Docker Desktop Kubernetes + kubectl.

COMPOSE ?= docker compose
POWERSHELL ?= powershell

.PHONY: help start up stop down build rebuild restart logs ps status \
	shell-backend shell-client-ui shell-admin-ui \
	migrate createsuperuser test-backend test-client-ui test-admin-ui test-frontend clean \
	k8s-sync-env k8s-build k8s-apply k8s-start k8s-delete k8s-status

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
	@echo   make test-backend     Run Django tests
	@echo   make test-client-ui   Run client-ui Vitest suite
	@echo   make test-admin-ui    Run admin-ui Vitest suite
	@echo   make test-frontend    Run both UI Vitest suites
	@echo   make clean            Down + remove volumes (DESTROYS DB DATA)
	@echo   make k8s-sync-env     Build k8s ConfigMap/Secret from root .env
	@echo   make k8s-build        Build local images for Docker Desktop Kubernetes
	@echo   make k8s-apply        Sync .env then apply k8s manifests
	@echo   make k8s-start        One shot: build images + sync .env + apply
	@echo   make k8s-delete       Delete researchhub namespace
	@echo   make k8s-status       Show k8s pods and services

start up:
	$(COMPOSE) up --build -d

stop:
	$(COMPOSE) stop

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build

rebuild:
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

ps status:
	$(COMPOSE) ps

shell-backend:
	$(COMPOSE) exec backend sh

shell-client-ui:
	$(COMPOSE) exec client-ui sh

shell-admin-ui:
	$(COMPOSE) exec admin-ui sh

migrate:
	$(COMPOSE) exec backend python manage.py migrate

createsuperuser:
	$(COMPOSE) exec backend python manage.py createsuperuser

test-backend:
	$(COMPOSE) exec backend python manage.py test

test-client-ui:
	$(COMPOSE) exec client-ui npm test

test-admin-ui:
	$(COMPOSE) exec admin-ui npm test

test-frontend: test-client-ui test-admin-ui

clean:
	$(COMPOSE) down -v

# --- Docker Desktop Kubernetes (see k8s/README.md) ---
# ConfigMap + Secret are generated from root .env (same as Compose).

k8s-sync-env:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File k8s/sync-env.ps1

k8s-build:
	docker build -t researchhub-backend:local ./backend
	docker build -t researchhub-client-ui:local ./client-ui
	docker build -t researchhub-admin-ui:local ./admin-ui

k8s-apply: k8s-sync-env
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secret.yaml
	kubectl apply -f k8s/postgres.yaml
	kubectl apply -f k8s/backend.yaml
	kubectl apply -f k8s/client-ui.yaml
	kubectl apply -f k8s/admin-ui.yaml

k8s-start: k8s-build k8s-apply
	kubectl get pods,svc -n researchhub

k8s-delete:
	kubectl delete namespace researchhub --ignore-not-found

k8s-status:
	kubectl get pods,svc -n researchhub
