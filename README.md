# Simply Nuts Next

Conversion-ready monorepo for a phased move from prototype UI to Shopify Hydrogen.

## Apps
- `apps/prototype-web`: React + TypeScript + Vite prototype
- `apps/storefront-hydrogen`: reserved for Hydrogen app initialization

## Packages
- `packages/types`: shared domain types
- `packages/core`: business logic, state machine, schemas, event dispatch
- `packages/ui`: shared reusable components

## Run
```bash
npm run setup
npm run dev:prototype
```

If `vite: command not found` appears, run:
```bash
npm install --include=dev --workspaces --include-workspace-root
```
