# src — Project module documentation

This README gives a short description of each file under `src/` so developers can quickly understand responsibilities.

Files
-----

- `App.tsx` — Main UI component. Loads the list of `notas` (documents) from Supabase, renders cards, and opens two modals: `ModalEditar` (edit a nota) and `ControleEntrega` (manage item deliveries). Uses `CriarNota` to create new records.

- `main.tsx` — React entry point. Renders `<App />` and wires a simple IPC listener for messages from the Electron main process.

- `CriarNota.tsx` — Form + local list for creating a Nota and its Items, validates inputs, inserts a note and its items into the `notas` and `itens` tables in Supabase, then notifies the parent via `aoSalvar` callback.

- `ModalEditar.tsx` — Modal UI for editing a single Nota (status, dates, financials). Updates the `notas` table when changes are saved.

- `ControleEntrega.tsx` — Modal to register partial or incremental deliveries for a specific Item. Stores records in `historico_entregas` and displays a per-item delivery history and progress.

- `supabaseClient.ts` — Initializes the Supabase client using Vite environment variables. Shared across the app.

- `supabaseTypes.ts` — Central DB typing: defines `Nota`, `Item`, `HistoricoEntrega`, and a `Database` interface to describe Row/Insert/Update shapes. Used as the typing contract for queries and components.

- `utils.ts` — Small helper functions and constants: `formatarMoeda`, `tiposDocumento`, `apresentacoes` (unit mappings).

- `vite-env.d.ts` — Vite TypeScript declarations for `import.meta.env` (supabase environment vars).

- `index.css` / `App.css` — Styling.

Notes
-----
- The project uses `supabaseClient` to interact with Supabase. There was an attempt to enable `createClient<Database>` (policed/strong typing), but it caused friction with supabase-js types in some inserts/updates. Current approach keeps the client unparameterized and uses explicit casts at call sites where we need exact DB Insert/Update shapes. If you'd like, I can continue and finish turning the client strongly typed end-to-end.

Maintenance tips
----------------
- To add a new table to the DB typing, add a new entry under `Database.public.Tables` in `src/supabaseTypes.ts` and update UI components accordingly.
- Keep `vite-env.d.ts` updated with env variables used in `supabaseClient.ts` to keep TypeScript happy.

If you'd like I can split this into per-file `README.md` files (one next to each component) — tell me and I'll create them.