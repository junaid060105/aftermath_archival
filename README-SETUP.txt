AFTERPLAY — GitHub Pages setup (no Node.js or terminal required)

PART 1 — Upload the website
1. Open your GitHub repository named afterplay.
2. Click Add file > Upload files.
3. Open the afterplay-pages folder from this ZIP on your computer.
4. Upload index.html, styles.css, app.js, and README-SETUP.txt to the ROOT of the repository. Do not upload the folder itself.
5. Commit changes.
6. In the repository, open Settings > Pages.
7. Under Build and deployment choose Deploy from a branch; select main and /(root), then Save.
8. Wait a minute or two. GitHub will show your website URL.

PART 2 — Enable automatic Steam game lookup (optional but recommended)
GitHub Pages cannot run a backend. The site works as a personal archive without this, but automatic Steam lookup needs the small Cloudflare Worker included in worker/worker.js.
1. Sign in to Cloudflare and open Workers & Pages.
2. Create a Worker; choose the option to start with Hello World.
3. Open its code editor, replace the starter code with the entire contents of worker/worker.js, and Deploy.
4. Copy the Worker URL (it looks like https://your-worker-name.your-account.workers.dev).
5. In your GitHub repository, open app.js and click the pencil/edit icon.
6. Near the top, find: const API_BASE = "";
7. Put your Worker URL between the quotes, e.g. const API_BASE = "https://your-worker-name.your-account.workers.dev";
8. Commit the change and wait for GitHub Pages to redeploy.

Notes:
- Your game list is saved in this browser's local storage. It is not synced between devices or browsers.
- Automatic lookup uses Steam's public store endpoints. Some games are not listed on Steam; those can be added manually.
- Keep the Worker URL exactly as provided, with no trailing slash.
- Never put private API keys or passwords in app.js.
