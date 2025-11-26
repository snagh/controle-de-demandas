Packaging notes for Windows

Problem:
When running electron-builder on Windows the tool downloads helper archives (e.g. winCodeSign) that contain symlinked files for other platforms (darwin). When 7-Zip extracts these archives, creating symlinks can fail on Windows if the current user doesn't have symlink privileges. This shows up as repeated "Cannot create symbolic link : O cliente não tem o privilégio necessário" and the packaging aborts.

Quick fixes (recommend this order):
1) Run the packing command in an elevated terminal (Administrator). On Windows: right-click on Terminal / PowerShell / Cmd and "Run as administrator".

2) Enable Windows Developer Mode (lets regular users create symlinks without admin privileges):
   - Settings -> Privacy & security -> For developers -> turn on "Developer Mode"
   - Re-run the packaging command in a new terminal after the change.

3) If you don't need cross-platform packaging on your machine, run packaging for the specific platform only (e.g., Windows):

   # from project root (bash / WSL / Git Bash)
   npm run package:win

4) If you want to avoid automatic packaging during an ordinary `npm run build`, there's now a separation:
   - `npm run build` = build TypeScript + Vite (no packaging)
   - `npm run package:win` = run electron-builder for Windows only
   - `npm run package:all` = run electron-builder for all configured targets (mac, win, linux)

Notes:
- If you still see 7-Zip extraction errors, try clearing the electron-builder cache at:
  %LOCALAPPDATA%\electron-builder\Cache
  and re-run packaging as administrator.

If you want, I can add a small helper script that checks for admin privileges and shows a friendly error message, or configure the builder to not attempt certain helper downloads. Let me know which you prefer.