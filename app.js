(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const STORAGE_KEY = "afterplay_games";
  // Paste your Cloudflare Worker URL here after deploying worker/worker.js.
  const API_BASE = "https://afterplay-api.jnxd1816.workers.dev";
  const STATUSES = ["Just started", "Playing", "Paused", "Finished", "Completed 100%", "Dropped", "Backlog"];
  const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo", "Mobile", "Other"];
  const GENRES = ["Action", "Adventure", "Racing", "Sports", "RPG", "Shooter", "Strategy", "Simulation", "Horror", "Other"];
  const colors = ["#c7ff4a", "#70b7ff", "#b48aff", "#ff9c62", "#ff6f91", "#50d6bb", "#d7dce3", "#a2a9b5", "#f0d36b"];
  let games = loadGames();
  let selectedGameId = null;
  let lookupTimer = null;
  let lookupAbort = null;
  let chart = null;

  const starter = [
    { id: crypto.randomUUID(), name: "Red Dead Redemption 2", genre: "Adventure", device: "PC", status: "Backlog", cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg", summary: "An open-world Western following Arthur Morgan and the Van der Linde gang in the final years of the American frontier.", source: "Game archive", appId: "", notes: "" },
    { id: crypto.randomUUID(), name: "Forza Horizon 4", genre: "Racing", device: "PC", status: "Backlog", cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1293830/library_600x900.jpg", summary: "An open-world racing festival set in a fictionalised Britain, with dynamic seasons and a large collection of cars.", source: "Game archive", appId: "", notes: "" },
    { id: crypto.randomUUID(), name: "F1 25", genre: "Racing", device: "PC", status: "Backlog", cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3059520/library_600x900.jpg", summary: "The official Formula One game for the 2025 season.", source: "Game archive", appId: "", notes: "" },
    { id: crypto.randomUUID(), name: "EA SPORTS FC 26", genre: "Sports", device: "PC", status: "Backlog", cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405690/library_600x900.jpg", summary: "EA's football simulation featuring club football, refreshed gameplay options and career modes.", source: "Game archive", appId: "", notes: "" },
    { id: crypto.randomUUID(), name: "Traffic Rider", genre: "Racing", device: "Mobile", status: "Backlog", cover: "", summary: "A first-person motorcycle racing game built around weaving through highway traffic.", source: "Manual starter entry", notes: "" }
  ];

  function loadGames() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeGame) : null;
    } catch { return null; }
  }
  function normalizeGame(game) {
    return {
      id: game.id || crypto.randomUUID(),
      name: String(game.name || "Untitled game"),
      genre: GENRES.includes(game.genre) ? game.genre : "Other",
      device: PLATFORMS.includes(game.device) ? game.device : "Other",
      status: STATUSES.includes(game.status) ? game.status : "Backlog",
      cover: game.cover || "",
      landscape: game.landscape || "",
      summary: game.summary || "",
      releaseDate: game.releaseDate || "",
      developer: game.developer || "",
      source: game.source || "",
      sourceUrl: game.sourceUrl || "",
      appId: game.appId || "",
      review: game.review || null,
      notes: game.notes || ""
    };
  }
  if (!games) { games = starter.map(normalizeGame); persist(); }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(games)); }

  function toast(message) {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2300);
  }
  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  
function fallbackCover(name) {
  return `
    <div class="cover-placeholder">
      <span class="fallback-label">AFTERPLAY / NO COVER ART</span>
      <strong>${escapeText(name)}</strong>
      <span class="fallback-mark">GAME ARCHIVE</span>
    </div>
  `;
}
  
  function createChip(text, extra = "") {
    const el = document.createElement("span"); el.className = `chip ${extra}`.trim(); el.textContent = text; return el;
  }
  
function updateBackdrop(game) {
  const backdrop = $("#backdrop");
  const image = game?.landscape || game?.cover || "";

  if (image) {
    backdrop.style.backgroundImage =
      `url("${image.replace(/["\\]/g, "")}")`;
    backdrop.style.opacity = ".42";
  } else {
    backdrop.style.backgroundImage = "none";
    backdrop.style.opacity = ".08";
  }
}


  function render() {
    renderLibrary(); renderStats();
    $("#totalCount").textContent = `${String(games.length).padStart(2, "0")} GAMES LOGGED`;
  }
  function renderLibrary() {
    const carousel = $("#gameCarousel"); carousel.replaceChildren();
    const query = $("#filterInput").value.trim().toLowerCase();
    const status = $("#statusFilter").value;
    const visible = games.filter(game =>
      game.name.toLowerCase().includes(query) &&
      (status === "all" || game.status === status)
    );
    visible.forEach(game => {
      const card = document.createElement("button"); card.type = "button"; card.className = "game-card";
      card.setAttribute("aria-label", `Open ${game.name}`);
      
if (game.cover) {
  const img = document.createElement("img");
  img.src = game.cover;
  img.alt = `${game.name} cover`;
  img.loading = "lazy";

  img.onerror = () => {
    if (game.landscape && img.src !== game.landscape) {
      img.src = game.landscape;
      img.style.objectFit = "contain";
      img.style.background = "#111820";
    } else {
      img.remove();
      card.classList.add("no-cover");
      card.insertAdjacentHTML("afterbegin", fallbackCover(game.name));
    }
  };

  card.append(img);
} else {
  card.classList.add("no-cover");
  card.insertAdjacentHTML("afterbegin", fallbackCover(game.name));
}

      const info = document.createElement("div"); info.className = "game-info";
      const title = document.createElement("h3"); title.textContent = game.name;
      const chips = document.createElement("div"); chips.className = "chips";
      chips.append(createChip(game.genre), createChip(game.device), createChip(game.status, "status"));
      info.append(title, chips); card.append(info);
      card.addEventListener("mouseenter", () => updateBackdrop(game));
      card.addEventListener("focus", () => updateBackdrop(game));
      card.addEventListener("mouseleave", () => updateBackdrop(null));
      card.addEventListener("blur", () => updateBackdrop(null));
      card.addEventListener("click", () => openDetails(game.id));
      carousel.append(card);
    });
    const add = document.createElement("button"); add.type = "button"; add.className = "add-card";
    add.innerHTML = "<b>＋</b><span>Add another game</span>"; add.addEventListener("click", openAddDialog); carousel.append(add);
    if (!visible.length) {
      const empty = document.createElement("div"); empty.className = "empty-note"; empty.textContent = "No games match this filter."; carousel.append(empty);
    }
  }
  function renderStats() {
    const genreCounts = countBy("genre"), platformCounts = countBy("device");
    const entries = Object.entries(genreCounts).sort((a,b) => b[1]-a[1]);
    const canvas = $("#genreChart"), empty = $("#chartEmpty");
    if (chart) { chart.destroy(); chart = null; }
    if (!entries.length) { empty.hidden = false; canvas.hidden = true; }
    else {
      empty.hidden = true; canvas.hidden = false;
      if (window.ChartDataLabels) Chart.register(ChartDataLabels);
      chart = new Chart(canvas, {
        type: "doughnut",
        data: { labels: entries.map(([name]) => name), datasets: [{ data: entries.map(([,count]) => count), backgroundColor: entries.map((_,i) => colors[i % colors.length]), borderColor: "#121923", borderWidth: 4, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: { position: "right", labels: { color: "#c5ced8", boxWidth: 9, boxHeight: 9, padding: 13, font: { family: "DM Sans", size: 10 } } }, datalabels: { color: "#10151c", font: { weight: "700", size: 11 }, formatter: (value, context) => { const total = context.dataset.data.reduce((a,b) => a+b, 0); return total ? `${Math.round(value / total * 100)}%` : ""; }, display: context => { const total = context.dataset.data.reduce((a,b) => a+b, 0); return total && context.dataset.data[context.dataIndex] / total >= 0.08; } }, tooltip: { callbacks: { label: context => ` ${context.label}: ${context.raw} (${Math.round(context.raw / games.length * 100)}%)` } } } }
      });
    }
    const grid = $("#platformGrid"); grid.replaceChildren();
    PLATFORMS.forEach(platform => {
      const box = document.createElement("div"); box.className = "platform-stat";
      const strong = document.createElement("strong"); strong.textContent = platformCounts[platform] || 0;
      const label = document.createElement("span"); label.textContent = platform;
      box.append(strong, label); grid.append(box);
    });
  }
  function countBy(key) {
    return games.reduce((counts, game) => { const value = game[key] || "Other"; counts[value] = (counts[value] || 0) + 1; return counts; }, {});
  }

  const gameDialog = $("#gameDialog"), detailDialog = $("#detailDialog");
  function openAddDialog() {
    $("#gameForm").reset(); $("#formTitle").textContent = "Add a game";
    $("#lookupMessage").textContent = "Search across game databases and web results, including fan games and ROM hacks. Select the correct result to fill in available details.";
    $("#lookupChoices").replaceChildren(); selectedGameId = null;
    gameDialog.showModal(); $("#gameName").focus();
  }
  function closeDialog(id) { const dialog = document.getElementById(id); if (dialog?.open) dialog.close(); }
  document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => closeDialog(button.dataset.close)));

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  }
  function standardizeTitle(title) {
    const key = title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
    const aliases = {
      "gta 5": "Grand Theft Auto V", "gta v": "Grand Theft Auto V", "gta5": "Grand Theft Auto V",
      "grand theft auto 5": "Grand Theft Auto V", "grand theft auto v": "Grand Theft Auto V",
      "rdr 2": "Red Dead Redemption 2", "rdr2": "Red Dead Redemption 2",
      "fh 4": "Forza Horizon 4", "fh4": "Forza Horizon 4", "fh 5": "Forza Horizon 5", "fh5": "Forza Horizon 5"
    };
    return aliases[key] || title.trim();
  }
  async function lookupTitle(title) {
    if (lookupAbort) lookupAbort.abort();
    lookupAbort = new AbortController();
    if (!API_BASE) throw new Error("Online search is not connected yet. Follow the one-time Cloudflare setup in README-SETUP.txt. You can still add games manually.");
    const normalized = standardizeTitle(title);
    const response = await fetch(`${API_BASE}/api/lookup?q=${encodeURIComponent(normalized)}`, { signal: lookupAbort.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "No online match found.");
    return data;
  }
  function applyFetchedGame(game) {
    $("#gameName").value = game.name || "";
    if (GENRES.includes(game.genre)) $("#gameGenre").value = game.genre;
    $("#gameCover").value = game.cover || game.landscape || "";
    $("#gameSummary").value = game.summary || "";
    $("#gameRelease").value = game.releaseDate || "";
    $("#lookupMessage").textContent = `Details found via ${game.source || "online source"}. Review and save, or edit any field.`;
    $("#lookupChoices").replaceChildren();
    window.currentLookup = game;
  }
  function showChoices(matches) {
    const host = $("#lookupChoices"); host.replaceChildren();
    matches.forEach(match => {
      const button = document.createElement("button"); button.type = "button"; button.className = "lookup-option";
      if (match.thumbnail) {
        const img = document.createElement("img"); img.src = match.thumbnail; img.alt = ""; img.onerror = () => img.remove(); button.append(img);
      }
      const text = document.createElement("span"); const name = document.createElement("b"); name.textContent = match.name;
      const source = document.createElement("small"); source.textContent = `${match.source || "Online result"} · Choose this edition`;
      text.append(name, source); button.append(text);
      button.addEventListener("click", async () => {
        $("#lookupMessage").textContent = "Fetching full game details…";
        try { applyFetchedGame(await api(`/api/game/${encodeURIComponent(match.id)}`)); }
        catch (error) { $("#lookupMessage").textContent = `${error.message} You can still complete the form manually.`; }
      });
      host.append(button);
    });
  }
  $("#gameName").addEventListener("input", () => {
    clearTimeout(lookupTimer);
    if (lookupAbort) lookupAbort.abort();
    window.currentLookup = null;
    $("#gameCover").value = ""; $("#gameSummary").value = ""; $("#gameRelease").value = "";
    $("#lookupChoices").replaceChildren();
    const title = $("#gameName").value.trim();
    if (title.length < 2) { $("#lookupMessage").textContent = "Type at least two characters to search."; return; }
    $("#lookupMessage").textContent = "Searching game databases and web results…";
    lookupTimer = setTimeout(async () => {
      try {
        const result = await lookupTitle(title);
        if (result.match) applyFetchedGame(result.match);
        else if (result.matches?.length) {
          $("#lookupMessage").textContent = "Choose the correct game or edition:";
          showChoices(result.matches);
        } else $("#lookupMessage").textContent = "No online match found. Complete the details manually.";
      } catch (error) {
        if (error.name === "AbortError") return;
        $("#lookupMessage").textContent = `${error.message} Manual entry is available.`;
      }
    }, 500);
  });

  $("#gameForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = $("#gameName").value.trim();
    if (!name) return;
    const existing = selectedGameId ? games.find(g => g.id === selectedGameId) : null;
    const record = normalizeGame({
      ...(existing || {}),
      id: existing?.id || crypto.randomUUID(),
      name,
      genre: $("#gameGenre").value,
      device: $("#gameDevice").value,
      status: $("#gameStatus").value,
      cover: $("#gameCover").value.trim(),
      landscape: window.currentLookup?.landscape || existing?.landscape || "",
      summary: $("#gameSummary").value.trim(),
      releaseDate: $("#gameRelease").value.trim(),
      source: window.currentLookup?.source || existing?.source || "Manual",
      sourceUrl: window.currentLookup?.sourceUrl || existing?.sourceUrl || "",
      appId: window.currentLookup?.id || existing?.appId || "",
      notes: $("#gameNotes").value.trim()
    });
    if (existing) games = games.map(g => g.id === existing.id ? record : g);
    else games.unshift(record);
    persist(); render(); closeDialog("gameDialog"); toast(existing ? "Game updated" : "Game added to your library");
  });

  function openDetails(id) {
    const game = games.find(g => g.id === id); if (!game) return;
    selectedGameId = id; $("#detailName").textContent = game.name;
    const image = $("#detailImage");
    image.src = game.cover || game.landscape || ""; image.alt = `${game.name} cover`;
    image.onerror = () => {
      if (game.landscape && image.src !== game.landscape) { image.src = game.landscape; image.style.objectFit = "contain"; }
      else { image.style.display = "none"; }
    };
    image.onload = () => { image.style.display = "block"; };
    $("#detailChips").replaceChildren(createChip(game.genre), createChip(game.device), createChip(game.status, "status"));
    $("#detailSummary").textContent = game.summary || "No online description is available for this game yet.";
    $("#detailMeta").textContent = [game.releaseDate && `Release: ${game.releaseDate}`, game.developer && `Developer: ${game.developer}`, game.source && `Source: ${game.source}`].filter(Boolean).join(" · ");
    if (game.review?.label) {
      $("#detailRank").textContent = game.review.label;
      $("#detailRankNote").textContent = "Community information from the selected game source.";
    } else {
      $("#detailRank").textContent = "Not available";
      $("#detailRankNote").textContent = "No verified ranking is available for this entry.";
    }
    $("#editStatus").value = game.status; $("#editNotes").value = game.notes || "";
    detailDialog.showModal();
  }
  $("#updateGameButton").addEventListener("click", () => {
    const game = games.find(g => g.id === selectedGameId); if (!game) return;
    game.status = $("#editStatus").value; game.notes = $("#editNotes").value.trim();
    persist(); render(); closeDialog("detailDialog"); toast("Game details updated");
  });
  $("#deleteGameButton").addEventListener("click", () => {
    const game = games.find(g => g.id === selectedGameId); if (!game) return;
    if (!confirm(`Delete "${game.name}" from your library? This cannot be undone.`)) return;
    games = games.filter(g => g.id !== selectedGameId); selectedGameId = null;
    persist(); render(); closeDialog("detailDialog"); toast("Game deleted");
  });
  $("#addGameButton").addEventListener("click", openAddDialog);
  $("#filterInput").addEventListener("input", renderLibrary);
  $("#statusFilter").addEventListener("change", renderLibrary);
  gameDialog.addEventListener("click", event => { if (event.target === gameDialog) gameDialog.close(); });
  detailDialog.addEventListener("click", event => { if (event.target === detailDialog) detailDialog.close(); });

  render();
})();
