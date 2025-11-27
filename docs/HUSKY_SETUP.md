# Husky pre-commit setup

We added a pre-commit hook that runs two checks before allowing a commit to proceed locally:

- `npm run check:no-any` — scans `src/` and fails if `as any` appears outside `src/supabaseHelpers.ts` (our controlled boundary).
- `npm run lint` — runs ESLint.

How to activate Husky hooks on your machine

1. Install dependencies locally (if you haven't already):

   ```bash
   npm install
   ```

2. Run the `prepare` script to install Husky git hooks (only required once per clone):

   ```bash
   npm run prepare
   # or
   npx husky install
   ```

3. Husky will create the directory `.husky/` and install the hook(s). We already committed the `pre-commit` hook so it will run automatically.

Notes and troubleshooting

- If a commit fails locally because of linting or `check:no-any`, fix the reported issues and try again.
- CI can run the same commands in your pipeline; it's a good practice to add `npm run check:no-any` and `npm run lint` to your CI steps.

4. (Optional) Enable a pre-push hook locally

   We added a pre-push hook that runs the same checks as pre-commit to help catch issues before pushing.

   To enable it (after `npm run prepare` is already executed), you don't need additional setup — it's already committed to the repo as `.husky/pre-push` and will be active for your local repo.

   If you want to disable the push hook locally for a single push, run:

   ```bash
   git push --no-verify
   ```
