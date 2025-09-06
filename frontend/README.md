# Frontend Structure

This folder contains a feature- and component-oriented scaffold to organize the app’s UI. Use it as the place to add new code so developers know where to find things quickly.

## Goals
- Clear separation by business domain (features)
- Reusable shared components (UI, forms, tables, charts)
- Obvious locations for hooks, services, state, and assets

## Layout

src/
- app: App shell (providers, layout, routing setup)
- assets: Static assets (images, icons, fonts)
- components: Reusable, app-wide UI building blocks
- features: Domain modules
- hooks: Shared hooks not tied to a single feature
- pages: Top-level route pages (if not colocated under a feature)
- routes: Router config and helpers
- services: Cross-cutting API clients and gateways
- store: Global state management (if used)
- utils: General utilities and helpers
- types: Global TypeScript types/interfaces
- constants: Cross-cutting constants and enums
- config: Frontend configuration (env mapping, endpoints, feature flags)
- styles: Global styles and variables

features/
- auth: Authentication flows
- dashboard: KPIs and business performance visuals
- inventory: Items, stock levels, adjustments
- sales: Selling, invoices/receipts, POS flows
- purchases: Buying, supplier bills, GRNs
- pricing: Price lists, markups/discounts
- reporting: Reports, exports
- customers: Customer directory and interactions
- suppliers: Supplier directory and interactions

Each feature contains:
- components: Feature-specific, reusable pieces
- pages: Routed screens belonging to the feature
- hooks: Hooks specific to the feature
- services: Data access for the feature
- types: Feature-specific types/interfaces

## Notes
- This scaffold is empty by design; add files as you implement.
- If the project currently builds from the repository root `src/`, migrate code into `frontend/src/` before switching the build to this folder.
