Projeto: controle-de-demandas — Arquitetura (resumo)

ASCII Diagram (componentes e fluxo de dados):

  +-------------------------------+        +--------------------------+
  | Renderer (React)              |  <---> | Main process (Electron)  |
  |  - main.tsx (entry)           |        |  - electron main scripts | 
  |  - App.tsx                    |        +--------------------------+
  |  - CriarNota.tsx              |
  |  - ModalEditar.tsx            |                 |
  |  - ControleEntrega.tsx        |                 v
  +-------------------------------+        +--------------------------+
                |                                    |
                |           HTTP/REST (Supabase)     |
                |------------------------------------>
                |                                    |
         +-------------------------+      +------------------------------+
         | supabaseClient.ts       |      | Supabase (Postgres)          |
         | - createClient(...)     |      | - tables: notas, itens,      |
         | - holds env vars        |      |   historico_entregas         |
         +-------------------------+      +------------------------------+

Notas: 
- App.tsx queries the Supabase via supabaseClient to load records and render.
- CriarNota inserts notas and itens. ModalEditar updates notas. ControleEntrega inserts historico_entregas.

Tipagem:
- Types are centralized in src/supabaseTypes.ts (Nota, Item, HistoricoEntrega, Database).
- Query payload/rows should use these types for safe operations.

This file provides a quick visual summary of how the UI components, Supabase client and backend interact.