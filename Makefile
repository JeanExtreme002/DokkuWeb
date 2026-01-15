ifeq ($(filter help install,$(MAKECMDGOALS)),)
  include .env
endif

.PHONY: run
run:  ## Run server
	@pnpm next dev -p $(PORT)

.PHONY: install
install:  ## Install dependencies
	@pnpm install --frozen-lockfile
	@[ -f .env ] || cp .env.sample .env

.PHONY: lint
lint:  ## Run lint
	@pnpm lint

.PHONY: lint-fix
lint-fix:  ## Run fixer for lint
	@pnpm lint:fix

.PHONY: test
test:  ## Run unit tests
	@pnpm typecheck
	@pnpm test

.PHONY: cypress
cypress:  ## Open cypress
	@pnpm cypress

.PHONY: docker-run
docker-run:  ## Run server on Docker
	@docker compose up --build frontend -d

.PHONY: docker-lint
docker-lint:  ## Run lint on Docker
	@docker compose up --build --exit-code-from lint lint

.PHONY: docker-test
docker-test:  ## Run unit tests on Docker
	@docker compose up --build --exit-code-from test test

.PHONY: docker-stop
docker-stop:  ## Stop the entire project on Docker
	@docker compose down

.PHONY: help
help:  ## List commands
	@echo ""; \
	echo "Available commands:"; \
	echo ""; \
	grep -E '^[a-zA-Z0-9_-]+:.*?## ' Makefile | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'; \
	echo ""
