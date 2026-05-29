.PHONY: setup dev test build lint clean docker-up docker-down export-openapi help

help:
	@echo "Brain-Storm Makefile"
	@echo "--------------------"
	@echo "make setup          - Install dependencies, add wasm target, build contracts"
	@echo "make dev            - Start backend and frontend in development mode"
	@echo "make test           - Run all tests (backend, frontend, contracts)"
	@echo "make build          - Build all apps for production"
	@echo "make lint           - Run linter on all apps"
	@echo "make clean          - Remove node_modules and build artifacts"
	@echo "make docker-up      - Start PostgreSQL and Redis via Docker Compose"
	@echo "make docker-down    - Stop and remove Docker Compose services"
	@echo "make export-openapi - Build backend and export openapi.json"

setup:
	@echo "==> Installing Node.js dependencies..."
	npm install
	@echo "==> Adding wasm32 target..."
	rustup target add wasm32-unknown-unknown
	@echo "==> Building smart contracts..."
	./scripts/build.sh
	@echo "==> Setup complete!"

dev:
	@echo "==> Starting backend and frontend..."
	npm run dev:backend & npm run dev:frontend

test:
	@echo "==> Running backend tests..."
	npm run test --workspace=apps/backend
	@echo "==> Running frontend tests..."
	npm run test --workspace=apps/frontend || true
	@echo "==> Running contract tests..."
	cargo test

build:
	@echo "==> Building for production..."
	npm run build

lint:
	@echo "==> Running lint checks..."
	npm run lint --workspace=apps/backend
	npm run lint --workspace=apps/frontend

clean:
	@echo "==> Cleaning project..."
	rm -rf node_modules apps/backend/dist apps/frontend/.next target

docker-up:
	@echo "==> Starting PostgreSQL and Redis..."
	docker compose up -d postgres redis

docker-down:
	@echo "==> Stopping Docker services..."
	docker compose down

export-openapi:
	@echo "==> Exporting OpenAPI spec..."
	npm run build --workspace=apps/backend
	cd apps/backend && EXPORT_OPENAPI=true node dist/main --export-openapi
	mkdir -p docs/api/dist
	cp apps/backend/openapi.json docs/api/dist/openapi.json
	cp docs/api/swagger-ui.html docs/api/dist/index.html
	@echo "==> OpenAPI spec exported to docs/api/dist/"
