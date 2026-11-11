AFTERPLAY — GitHub Pages setup (no Node.js or terminal required)

WHAT THIS UPDATE FIXES
- GTA 5, GTA V, GTA5, Grand Theft Auto 5 and Grand Theft Auto V are standardized to one canonical title during lookup.
- Added aliases for RDR2, FH4 and FH5.
- Game profile opens with the artwork contained in its own panel, alongside the game information (not as a full-screen zoomed image).
- Genre chart displays percentage labels directly on the doughnut slices where there is enough room; hover also shows count and percentage.
- Release date, description, cover URL and personal notes are optional. Only the game title is required; genre, device and status have sensible defaults.
- Steam portrait artwork is attempted first, with a landscape header fallback if the portrait asset is unavailable.

PART 1 — Upload website files
1. Open your GitHub repository.
2. Click Add file > Upload files.
3. Extract this ZIP on your computer and open the afterplay-pages folder.
4. Upload index.html, styles.css, app.js and README-SETUP.txt into the repository ROOT (not inside another folder).
5. Commit changes. If GitHub asks whether to replace existing files, confirm.
6. Keep Settings > Pages set to Deploy from a branch, branch main, folder /(root).

PART 2 — Connect automatic game search (required for online lookup)
GitHub Pages is static hosting and cannot run the lookup backend itself. The site will still let you add games manually until this one-time setup is complete.
1. Sign in to Cloudflare and open Workers & Pages.
2. Create a Worker (start with a simple Hello World worker).
3. Open the Worker code editor, replace all starter code with the complete contents of worker/worker.js from this ZIP, then Deploy.
4. Copy the Worker URL. It should look like https://your-worker-name.your-account.workers.dev
5. In your GitHub repository, open app.js and click Edit (pencil).
6. Near the top, find: const API_BASE = "";
7. Replace it with your exact Worker URL, for example: const API_BASE = "https://your-worker-name.your-account.workers.dev";
   Do not add a trailing slash.
8. Commit changes and wait for GitHub Pages to redeploy.
9. Test by adding GTA 5, GTA V, Grand Theft Auto 5 or Grand Theft Auto V. The search should resolve those aliases to Grand Theft Auto V. If multiple editions appear, choose the correct result.

IMPORTANT NOTES
- Steam lookup only finds games listed on Steam. Mobile/console-only games may need manual entry.
- A specific Steam game may not have portrait library artwork. The app will try its landscape header image as a fallback; a custom image URL can also be entered manually.
- Your library is stored in this browser's local storage. It is not synced across devices or browsers, and clearing browser site data can erase it. Export/backup is not included in this version.
- Never put private API keys or passwords in app.js. This Worker uses public Steam store endpoints and does not require a Steam API key.
