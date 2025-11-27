# Generating Supabase TypeScript types

This project uses a central `src/supabaseTypes.ts` that describes the database schema (Rows / Insert / Update shapes).

For perfect end-to-end typing you should generate the types directly from your Supabase project. That ensures `@supabase/supabase-js` generics line up and removes the need for `as any` at a single boundary.

## Recommended approach (Supabase CLI)

1. Install the supabase CLI (if not installed):

   - macOS / Linux (Homebrew):
     ```bash
     brew install supabase/tap/supabase
     ```

   - Windows (scoop/choco) or follow installer on https://supabase.com/docs/guides/cli

2. Export your project ref (project id) — you can find it in the Supabase Dashboard URL (the project reference) or in Project Settings.

3. Run the generator locally (in the repo root):

```bash
# Replace <PROJ_REF> with your project id / ref, or set SUPABASE_PROJECT_ID export
export SUPABASE_PROJECT_ID=<PROJ_REF>
npm run supabase:gen-types
```

This will overwrite `src/supabaseTypes.ts` with the generated types.

## If you prefer CI-based generation
- You can run the same command on CI. Make sure to add SUPABASE_PROJECT_ID or use the supabase CLI authentication in CI.

## After generating types
- Commit the new `src/supabaseTypes.ts`. That will let us remove the single `as any` boundary inside `src/supabaseHelpers.ts` and make the client fully typed.

## Security note
- Don't commit secrets; generating types requires only the public project id in most workflows and/or authenticated CLI session. If you're unsure, run the generator locally and commit the result.
