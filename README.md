# urbanflow-mobility

## Tests

Lancer tous les tests du monorepo :

```bash
pnpm -r test
```

Ou par application :

```bash
pnpm --filter @urbanflow/web test   # frontend (Vitest)
pnpm --filter api test              # backend (Jest)
```

Autres commandes utiles côté backend :

```bash
pnpm --filter api test:watch   # mode watch
pnpm --filter api test:cov     # avec couverture
pnpm --filter api test:e2e     # tests end-to-end
```

Et côté frontend :

```bash
pnpm --filter @urbanflow/web test:watch   # mode watch
```
