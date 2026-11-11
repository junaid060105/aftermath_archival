AFTERPLAY — UNIVERSAL GAME SEARCH UPDATE

This update removes Steam from game lookup. It adds a multi-source search backend:
- RAWG: structured game metadata, covers, release dates and genres (requires a free API key).
- Wikipedia: searchable pages and article summaries/images, useful for known games and some fan projects.
- Wikidata: structured community-maintained entries.
- Brave Search: wider web results, useful for obscure titles, ROM hacks and fan games (requires an API subscription key; check current pricing/limits).

IMPORTANT: no single public database contains every ROM hack or fan game. This setup combines sources and still allows manual entry for anything not indexed.

PART A — Update the website
1. Open your GitHub repository.
2. Upload index.html, styles.css and app.js from this folder to the repository ROOT, replacing existing files.
3. Commit changes.
4. app.js is already configured to use your existing Worker URL:
   https://afterplay-api.jnxd1816.workers.dev

PART B — Replace Cloudflare Worker code
1. Open Cloudflare > Workers & Pages > afterplay-api > Edit code.
2. Replace all existing code with the complete contents of worker/worker.js in this package.
3. Click Deploy.
4. Test the root URL. It should return JSON with service "AFTERPLAY Universal Game Search".

PART C — Optional: add RAWG for structured game catalogue results
1. Create a RAWG account and request an API key at https://rawg.io/apidocs.
2. In Cloudflare, open afterplay-api > Settings > Variables and Secrets.
3. Add a secret named RAWG_API_KEY and paste your key as its value.
4. Save and deploy/redeploy.
RAWG's free plan is intended for personal/hobby projects, has request limits and requires attribution with an active link where its data/images are used. Review RAWG's current terms before use.

PART D — Optional: wider web search for ROM hacks and fan games
1. Obtain a Brave Search API key from https://brave.com/search/api/.
2. Add a Cloudflare secret named BRAVE_API_KEY with that key as its value.
3. Save and redeploy.
Check Brave's current plan, pricing, and request limits before subscribing. Do not paste API keys into GitHub or app.js.

TESTS
- Search Pokémon Unbound, Pokémon Radical Red, Pokémon Emerald, GTA 5, Forza Horizon 4.
- Results can come from different sources. Select the correct result to fetch its available details.
- If a ROM hack is not indexed in the selected sources, you can still save it manually and add a cover URL/description.

DATA AND PRIVACY
- Search requests go through your Cloudflare Worker to the selected public data providers.
- Your personal collection remains in this browser's local storage.
- Do not publish API keys in the GitHub repository.


FIRST-VISIT EXPERIENCE
- New visitors see an animated WELCOME, GAMER screen and enter a display name.
- The name is stored locally in this browser and used in the archive header/avatar.
- New browser profiles start with an empty library and an invitation to add the first game.
- Existing saved games are preserved; this update does not erase browser storage.
- To test a truly new-user view in the same browser, use a private/incognito window.
