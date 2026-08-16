# UrbanFlow Mobility

PWA de mobilité urbaine (Lille / MEL) : recherche d'itinéraires multimodaux (transports en commun, vélo, marche, trottinette), suivi de trajet en temps réel, alertes de perturbation et gestion de profil.

Monorepo pnpm composé de :

- **`apps/web`** — Front-end Next.js 16 (App Router, React 19, Tailwind CSS 4, Zustand, PWA).
- **`apps/api`** — Back-end NestJS 11 (TypeORM/PostgreSQL, Redis/cache, JWT, WebSockets, GTFS-RT).
- **`packages/shared`** — Types et constantes partagés entre `web` et `api` (compilé en `dist/`, consommé comme dépendance).
- **`packages/ui`** — Composants UI partagés.

Services externes utilisés : **OpenTripPlanner** (calcul d'itinéraires, GTFS + OSM), **GBFS** V'Lille (Ilevia) et Lime (vélos/trottinettes en libre-service), **GTFS-RT ilévia** (alertes de perturbation).

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer l'application](#lancer-lapplication)
- [Base de données & migrations](#base-de-données--migrations)
- [Tests](#tests)
- [CI](#ci)
- [Déploiement](#déploiement)
- [Style de code & bonnes pratiques](#style-de-code--bonnes-pratiques)
- [Structure du projet](#structure-du-projet)

## Prérequis

- **Node.js 24** (voir `.nvmrc` — `nvm use`)
- **pnpm 11** (`packageManager` défini dans `package.json`, utiliser `corepack enable` ou installer la version exacte)
- **Docker** + **Docker Compose** (PostgreSQL, Redis, Adminer, OpenTripPlanner)
- **make** (optionnel mais recommandé, un `Makefile` fournit des raccourcis)

## Installation

```bash
git clone <url-du-repo>
cd urbanflow-mobility
nvm use            # aligne la version de Node sur .nvmrc
pnpm install        # installe les dépendances de tout le monorepo
```

Le package `@urbanflow/shared` est consommé via son `dist/` compilé (voir `packages/shared/package.json`, `main: dist/index.js`). Il doit donc être buildé avant de lancer `web` ou `api` en développement :

```bash
pnpm --filter @urbanflow/shared build
```

## Variables d'environnement

Copier le fichier d'exemple et compléter les valeurs :

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Identifiants PostgreSQL utilisés par Docker Compose |
| `NEXT_PUBLIC_API_URL` | URL de l'API exposée au front (défaut `http://localhost:3001`) |
| `PORT` | Port de l'API NestJS (défaut `3001`) |
| `FRONTEND_URL` | URL du front, utilisée pour la config CORS de l'API |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL complète (composée à partir des identifiants ci-dessus) |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Secrets de signature des tokens d'accès et de rafraîchissement |
| `REDIS_URL` | URL de connexion Redis (cache) |
| `OTP_GRAPHQL_URL` | Endpoint GraphQL d'OpenTripPlanner (défaut `http://localhost:8888/otp/gtfs/v1`) |
| `GBFS_VLILLE_STATION_INFORMATION_URL`, `GBFS_VLILLE_STATION_STATUS_URL` | Flux GBFS des stations V'Lille (Ilevia) |
| `GBFS_LIME_FREE_BIKE_STATUS_URL` | Flux GBFS des trottinettes Lime |
| `GTFS_RT_ALERTS_URL` | Flux GTFS-RT des alertes de perturbation ilévia |

Ces variables sont lues à la fois par Docker Compose (`POSTGRES_*`) et par les apps `web`/`api` (les autres).

## Lancer l'application

### Avec `make` (recommandé)

```bash
make up        # démarre PostgreSQL + Redis + Adminer + OpenTripPlanner (Docker)
make migration # applique les migrations TypeORM
make dev       # lance web (:3000) et api (:3001) en parallèle
```

Autres cibles utiles :

```bash
make dev-web    # uniquement le front (Next.js, :3000)
make dev-api    # uniquement l'API (NestJS --watch, :3001)
make logs       # logs des conteneurs Docker
make ps         # statut des conteneurs
make down       # arrête les conteneurs (conserve les données)
make clean      # arrête les conteneurs et supprime les volumes (reset complet)
make stop       # tue les process qui occupent les ports 3000/3001
```

### Sans `make`

```bash
docker compose --env-file .env.local up -d   # infrastructure (Postgres, Redis, Adminer, OTP)
pnpm --filter @urbanflow/api migration:run
pnpm dev                                      # web + api en parallèle
```

- Front : http://localhost:3000
- API : http://localhost:3001
- Adminer (client PostgreSQL web) : http://localhost:8080
- OpenTripPlanner : http://localhost:8888

### OpenTripPlanner — données GTFS/OSM

Le premier démarrage du conteneur `otp` construit son graph de routage à partir des données GTFS/OSM situées dans `otp-data/`. Pour les télécharger :

```bash
bash scripts/download-gtfs.sh
```

Le premier `docker compose up otp` (ou `make up`) peut alors prendre plusieurs minutes (build du graph). Les démarrages suivants rechargent le graph déjà construit.

## Base de données & migrations

TypeORM est utilisé en mode migrations explicites (`synchronize` désactivé, voir `apps/api/src/database/database.module.ts`) — tout changement de schéma doit passer par une migration.

```bash
pnpm --filter @urbanflow/api migration:generate src/database/migrations/NomDeLaMigration
pnpm --filter @urbanflow/api migration:run
pnpm --filter @urbanflow/api migration:revert
```

## Tests

Lancer tous les tests du monorepo :

```bash
pnpm -r test
```

Par application :

```bash
pnpm --filter @urbanflow/web test    # front (Vitest)
pnpm --filter @urbanflow/api test    # back — tests unitaires (Jest)
```

Autres commandes côté back (`apps/api`) :

```bash
pnpm --filter @urbanflow/api test:watch   # mode watch
pnpm --filter @urbanflow/api test:cov     # avec couverture
pnpm --filter @urbanflow/api test:e2e     # tests end-to-end
```

Côté front (`apps/web`) :

```bash
pnpm --filter @urbanflow/web test:watch   # mode watch
```

> ⚠️ `journey.e2e-spec.ts` appelle une vraie instance OpenTripPlanner (`localhost:8888`), sans mock. Pour l'exécuter en local, démarrer OTP au préalable (`docker compose up otp` / `make up`). Ce test est exclu du job CI e2e (pas d'infrastructure OTP provisionnée).
>
> Les tests e2e nécessitent une base PostgreSQL et Redis actifs (`make up`) ainsi que les migrations appliquées (`make migration`).

## CI

Le workflow GitHub Actions (`.github/workflows/`) se déclenche sur chaque push et chaque pull request, sur toutes les branches, et comprend deux jobs séquentiels.

### `lint-and-format`

```bash
pnpm install --frozen-lockfile
pnpm --filter @urbanflow/shared build   # requis avant tout lint/test qui importe @urbanflow/shared
pnpm --filter @urbanflow/web lint
pnpm --filter @urbanflow/api lint
pnpm format:check
```

### `test` (dépend de `lint-and-format`)

Nécessite PostgreSQL et Redis (fournis comme services éphémères dans la CI) :

```bash
pnpm --filter @urbanflow/shared build
pnpm --filter @urbanflow/api test
pnpm --filter @urbanflow/api migration:run
pnpm --filter @urbanflow/api test:e2e --testPathIgnorePatterns=journey.e2e-spec.ts
pnpm --filter @urbanflow/web test
```

### Reproduire la CI en local

```bash
pnpm install --frozen-lockfile
pnpm --filter @urbanflow/shared build
pnpm --filter @urbanflow/web lint
pnpm --filter @urbanflow/api lint
pnpm format:check
pnpm -r test
```

En cas d'échec du `format:check`, corriger automatiquement avec :

```bash
pnpm format
```

## Déploiement

Le déploiement est géré par `.github/workflows/deploy.yml`, séparé de la CI. Il se déclenche automatiquement (via `workflow_run`) quand le workflow CI a réussi sur `main` ou `develop`, mais chaque job (`deploy-prod` / `deploy-preprod`) référence un [GitHub Environment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) (`production` / `preprod`) avec des reviewers requis : le déploiement reste donc en attente d'une approbation manuelle dans l'onglet **Actions** avant de s'exécuter.

| Branche | Environment GitHub | Répertoire sur le VPS |
|---|---|---|
| `main` | `production` | `/home/urbanflow/urbanflow-prod` |
| `develop` | `preprod` | `/home/urbanflow/urbanflow-preprod` |

Une fois approuvé, le job se connecte en SSH au VPS (secrets `VPS_HOST` / `VPS_SSH_KEY`) et exécute :

```bash
git pull origin <branche>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T api pnpm --filter @urbanflow/api migration:run
```

## Style de code & bonnes pratiques

### Formatage — Prettier (`.prettierrc`)

Point virgule obligatoire, guillemets simples, virgule finale partout, largeur de ligne 100, indentation 2 espaces, parenthèses autour des paramètres fléchés, fins de ligne `LF`. Ne jamais formater à la main : `pnpm format` avant de committer, `pnpm format:check` pour vérifier sans modifier.

### Lint — ESLint (`.eslintrc.js` à la racine, config propre à chaque app)

- Pas d'export par défaut (`import/no-default-export: error`), sauf pour les fichiers conventionnels Next.js (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, fichiers de config) où l'export par défaut est requis par le framework.
- Règles `@typescript-eslint/recommended` et `react-hooks/recommended` actives — respecter les dépendances de hooks (`useEffect`, `useMemo`, `useCallback`).
- `pnpm --filter @urbanflow/api lint` applique `--fix` automatiquement ; `pnpm --filter @urbanflow/web lint` ne corrige pas seul, exécuter `pnpm format` en complément si besoin.

### Backend (NestJS)

- Schéma de base de données géré exclusivement par migrations TypeORM (`synchronize: false`) — ne jamais modifier une entité sans générer la migration correspondante.
- Validation des DTO via `class-validator`/`class-transformer`.
- Un module NestJS par domaine métier (`auth`, `profile`, `disruption-alerts`, `database`, etc.), avec ses propres `*.service.ts`, `*.controller.ts` et `*.spec.ts` colocalisés.
- Guards/décorateurs d'autorisation (ex. `RolesGuard`, `@Roles()`) pour restreindre l'accès par rôle utilisateur.

### Frontend (Next.js / React)

- App Router — composants serveur par défaut, `'use client'` uniquement quand nécessaire (état, effets, interactions navigateur).
- État global via Zustand (`store/`), stores dédiés par domaine (`useAuthStore`, `useActiveJourneyStore`, …).
- Logique métier réutilisable extraite dans `lib/` (fonctions pures, testées indépendamment des composants) plutôt que dupliquée dans les composants.
- Styles via Tailwind CSS 4 et variables CSS de thème (`var(--color-*)`) plutôt que des couleurs en dur.

### Tests

- Un fichier `*.spec.ts` colocalisé avec le code qu'il teste (backend Jest, frontend Vitest).
- Les fonctions utilitaires pures (`lib/`) sont couvertes en priorité — elles concentrent la logique métier critique (calculs géo, filtrage/tri d'itinéraires, etc.).
- Les tests e2e backend démarrent une vraie instance NestJS connectée à une vraie base ; ne pas les confondre avec les tests unitaires qui mockent les repositories.

### Commits & branches

- Une branche par ticket/US, nommée `US-<numéro>/<slug-descriptif>` (voir l'historique Git).
- Un commit doit correspondre à un changement cohérent et autonome (éviter de mélanger plusieurs fonctionnalités indépendantes dans un même commit).
- Le lint et le format doivent passer localement avant de pousser (voir [CI](#ci)) — la CI bloque la fusion sinon.

## Structure du projet

```
apps/
  api/                  # NestJS — API REST + WebSockets
    src/
      auth/             # authentification JWT, guards, rôles
      database/         # data source TypeORM, migrations
      disruption-alerts/# alertes de perturbation (GTFS-RT)
      profile/          # profil utilisateur
      users/            # entité utilisateur
      ...
    test/               # tests e2e
  web/                  # Next.js — PWA
    app/                # App Router (pages, layouts, composants de route)
    components/          # composants UI partagés à l'app
    lib/                # fonctions utilitaires, hooks, types
    store/               # stores Zustand
packages/
  shared/               # types/constantes partagés (buildé en dist/)
  ui/                   # composants UI partagés
docker/                 # assets Docker (ex. thème Adminer)
docs/                   # documentation de conception (plans, design)
otp-data/               # données GTFS/OSM pour OpenTripPlanner (non versionnées)
scripts/                # scripts utilitaires (téléchargement GTFS, …)
```
