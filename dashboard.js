const state = {
  rankings: [],
  sortKey: "simple_difficulty_index",
  sortDir: "asc",
};

const HISTORICAL_LOGOS = [
  { start: 2000, end: 2000, champion: "LAL", file: "champion_logos_real/lakers-1976.png", label: "Lakers" },
  { start: 2001, end: 2020, champion: "LAL", file: "champion_logos_real/lakers-2001.png", label: "Lakers" },
  { start: 2003, end: 2014, champion: "SAS", file: "champion_logos_real/spurs-2002.png", label: "Spurs" },
  { start: 2004, end: 2004, champion: "DET", file: "champion_logos_real/pistons-2001.png", label: "Pistons" },
  { start: 2006, end: 2013, champion: "MIA", file: "champion_logos_real/heat-1999.png", label: "Heat" },
  { start: 2008, end: 2024, champion: "BOS", file: "champion_logos_real/celtics-1996.png", label: "Celtics" },
  { start: 2011, end: 2011, champion: "DAL", file: "champion_logos_real/mavericks-2001.png", label: "Mavericks" },
  { start: 2015, end: 2018, champion: "GSW", file: "champion_logos_real/warriors-2010.png", label: "Warriors" },
  { start: 2022, end: 2022, champion: "GSW", file: "champion_logos_real/warriors-2019.png", label: "Warriors" },
  { start: 2016, end: 2016, champion: "CLE", file: "champion_logos_real/cavaliers-2010.png", label: "Cavaliers" },
  { start: 2019, end: 2019, champion: "TOR", file: "champion_logos_real/raptors-2015.png", label: "Raptors" },
  { start: 2021, end: 2021, champion: "MIL", file: "champion_logos_real/bucks-2015.png", label: "Bucks" },
  { start: 2023, end: 2023, champion: "DEN", file: "champion_logos_real/nuggets-2018.png", label: "Nuggets" },
  { start: 2025, end: 2025, champion: "OKC", file: "champion_logos_real/thunder-2008.png", label: "Thunder" },
];

function getLogoForRow(row) {
  return HISTORICAL_LOGOS.find((entry) => (
    entry.champion === row.champion &&
    row.year >= entry.start &&
    row.year <= entry.end
  )) ?? null;
}

function renderChampion(row) {
  const logo = getLogoForRow(row);
  if (!logo) {
    return `<span class="champion-text">${row.champion_name}</span>`;
  }
  return `
    <span class="champion-cell">
      <img class="champion-logo" src="./${logo.file}" alt="${row.year} ${logo.label} badge">
      <span class="champion-text">${row.champion_name}</span>
    </span>
  `;
}

function renderMethodology() {
  const target = document.getElementById("methodology");
  target.innerHTML = `
    <p class="method-copy">
      The rating gets easier when a champion's playoff opponents lose more VORP to injury and when strong teams from the
      prior season lose star value badly enough to fall out of the playoff field.
    </p>
    <p class="formula-label">Formula</p>
    <p class="formula-block">Difficulty Rating = 0.50 &times; simple_playoff_score + 0.50 &times; simple_contender_dropout_score
simple_playoff_score = &Sigma;(VORP &times; playoff_availability) / &Sigma;(VORP)
simple_contender_dropout_score = &Sigma;(VORP &times; season_availability) / &Sigma;(VORP)
playoff_availability = games_played_in_series / series_length
season_availability = min(games_played / expected_games, 1.0)</p>
  `;
}

async function loadDashboard() {
  const response = await fetch("./output/title_difficulty_dashboard.json");
  if (!response.ok) {
    throw new Error("Could not load dashboard output. Run the pipeline first.");
  }
  return response.json();
}

function renderStats(summary) {
  const container = document.getElementById("summary-cards");
  const cards = [
    {
      label: "Average Difficulty Rating",
      value: summary.rankings_average_simple?.toFixed(3) ?? summary.average_difficulty?.toFixed(3) ?? "N/A",
      detail: "Higher means a harder title environment.",
    },
    {
      label: "Easiest Title",
      value: summary.easiest_simple_title ? `${summary.easiest_simple_title.year}` : "N/A",
      valueHtml: summary.easiest_simple_title ? `
        <span class="summary-title-row">
          ${renderChampion(summary.easiest_simple_title)}
          <span class="summary-title-year">${summary.easiest_simple_title.year}</span>
        </span>
      ` : null,
      detail: summary.easiest_simple_title ? `Difficulty Rating ${summary.easiest_simple_title.simple_difficulty_index.toFixed(3)}` : "",
    },
    {
      label: "Hardest Title",
      value: summary.hardest_simple_title ? `${summary.hardest_simple_title.year}` : "N/A",
      valueHtml: summary.hardest_simple_title ? `
        <span class="summary-title-row">
          ${renderChampion(summary.hardest_simple_title)}
          <span class="summary-title-year">${summary.hardest_simple_title.year}</span>
        </span>
      ` : null,
      detail: summary.hardest_simple_title ? `Difficulty Rating ${summary.hardest_simple_title.simple_difficulty_index.toFixed(3)}` : "",
    },
  ];

  container.innerHTML = cards.map((card) => `
    <article class="card">
      <p class="card-label">${card.label}</p>
      <p class="card-value">${card.valueHtml ?? card.value}</p>
      <p class="card-note">${card.detail}</p>
    </article>
  `).join("");
}

function renderRankingRows(rankings) {
  const body = document.getElementById("ranking-body");
  body.innerHTML = rankings.map((row) => `
    <tr>
      <td>${row.year}</td>
      <td>${renderChampion(row)}</td>
      <td>${row.simple_difficulty_index?.toFixed(3) ?? "N/A"}</td>
      <td>${row.simple_playoff_score?.toFixed(3) ?? "N/A"}</td>
      <td>${row.simple_contender_dropout_score?.toFixed(3) ?? "N/A"}</td>
    </tr>
  `).join("");
}

function sortRows(rows) {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    const av = a[state.sortKey];
    const bv = b[state.sortKey];

    if (typeof av === "string" && typeof bv === "string") {
      return state.sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }

    const aNum = av ?? Number.NEGATIVE_INFINITY;
    const bNum = bv ?? Number.NEGATIVE_INFINITY;
    return state.sortDir === "asc" ? aNum - bNum : bNum - aNum;
  });
  return sorted;
}

function getFilteredRows() {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  const yearMin = Number(document.getElementById("year-min").value || 0);
  const yearMax = Number(document.getElementById("year-max").value || 9999);

  const filtered = state.rankings.filter((row) => {
    const haystack = `${row.year} ${row.champion} ${row.champion_name}`.toLowerCase();
    const matchesQuery = haystack.includes(query);
    const matchesYear = row.year >= yearMin && row.year <= yearMax;
    return matchesQuery && matchesYear;
  });

  return sortRows(filtered);
}

function rerenderTable() {
  renderRankingRows(getFilteredRows());
}

function wireControls() {
  document.getElementById("search-input").addEventListener("input", rerenderTable);
  document.getElementById("year-min").addEventListener("input", rerenderTable);
  document.getElementById("year-max").addEventListener("input", rerenderTable);

  document.querySelectorAll(".sort-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = "asc";
      }
      rerenderTable();
    });
  });

  const explainToggle = document.getElementById("explain-toggle");
  const explainPanel = document.getElementById("explain-panel");
  explainToggle.addEventListener("click", () => {
    const isHidden = explainPanel.hasAttribute("hidden");
    if (isHidden) {
      explainPanel.removeAttribute("hidden");
      explainToggle.setAttribute("aria-expanded", "true");
    } else {
      explainPanel.setAttribute("hidden", "");
      explainToggle.setAttribute("aria-expanded", "false");
    }
  });
}

async function main() {
  try {
    const data = await loadDashboard();
    const simpleSorted = [...data.rankings]
      .filter((row) => row.simple_difficulty_index != null)
      .sort((a, b) => a.simple_difficulty_index - b.simple_difficulty_index);

    data.summary.rankings_average_simple = simpleSorted.length
      ? simpleSorted.reduce((sum, row) => sum + row.simple_difficulty_index, 0) / simpleSorted.length
      : null;
    data.summary.easiest_simple_title = simpleSorted[0] ?? null;
    data.summary.hardest_simple_title = simpleSorted[simpleSorted.length - 1] ?? null;

    state.rankings = data.rankings;
    renderStats(data.summary);
    renderMethodology();
    wireControls();
    rerenderTable();
  } catch (error) {
    document.body.innerHTML = `<main class="page"><section class="table-block"><h1>Dashboard unavailable</h1><p>${error.message}</p></section></main>`;
  }
}

main();
