# ResearchHub — Docker Compose helpers
# Requires: Docker + Docker Compose. Optional: GNU Make (or use docker compose directly).

COMPOSE ?= docker compose

.PHONY: help start up stop down build rebuild restart logs ps status \
	shell-backend shell-client-ui shell-admin-ui \
	migrate createsuperuser test-backend clean

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
	@echo   make clean            Down + remove volumes (DESTROYS DB DATA)

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

clean:
	$(COMPOSE) down -v
