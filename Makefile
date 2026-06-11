SHELL := /bin/zsh -l
COMPOSE := docker compose --env-file .env.local

.PHONY: up down stop dev dev-web dev-api build logs ps clean

## Démarre Postgres + Redis (Docker Compose) en arrière-plan
up:
	$(COMPOSE) up -d

## Arrête les conteneurs Docker (conserve les volumes/données)
down:
	$(COMPOSE) down

## Arrête les conteneurs ET supprime les volumes (reset complet des données)
clean:
	$(COMPOSE) down -v

## Affiche le statut des conteneurs
ps:
	$(COMPOSE) ps

## Affiche les logs des conteneurs (Ctrl+C pour quitter)
logs:
	$(COMPOSE) logs -f

## Lance web + api en parallèle (nécessite `make up` au préalable)
dev:
	pnpm dev

## Lance uniquement l'app web (Next.js) sur :3000
dev-web:
	pnpm --filter @urbanflow/web dev

## Lance uniquement l'API (NestJS, mode watch) sur :3001
dev-api:
	pnpm --filter @urbanflow/api start:dev

## Build les deux apps en production
build:
	pnpm --filter @urbanflow/web build
	pnpm --filter @urbanflow/api build

## Tue les process qui occupent les ports web/api (utile en cas de blocage)
stop:
	-lsof -ti :3000 | xargs kill
	-lsof -ti :3001 | xargs kill
