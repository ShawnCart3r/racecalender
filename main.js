const sheetURL = 'https://docs.google.com/spreadsheets/d/1H0pvW1hrIi3zCNPrIRN_oOKzN8Hw2RaY8vXERcmLiSU/gviz/tq?tqx=out:json&sheet=Sheet1';
const container = document.getElementById("race-container");
const searchInput = document.getElementById("search");
let monthMap = {};

function loadRaces() {
  fetch(sheetURL)
    .then(res => res.text())
    .then(raw => {
      const json = JSON.parse(raw.substring(47).slice(0, -2));
      const rows = json.table.rows;

      const today = new Date();
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const races = [];

      rows.forEach(row => {
        const rawDate = row.c[2]?.v;
        const name = row.c[3]?.v || "";
        const distance = row.c[4]?.v || "";
        const location = row.c[5]?.v || "";
        const link = row.c[6]?.v || "";

        const match = rawDate?.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (!match) return;

        const [_, y, m, d] = match;
        const date = new Date(Number(y), Number(m), Number(d));
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (dateOnly < todayOnly) return;

        const prettyDate = date.toLocaleDateString("en-US", {
          month: "long", day: "numeric", year: "numeric"
        });

        const isToday = dateOnly.getTime() === todayOnly.getTime();
        const isWeekend = [0, 6].includes(dateOnly.getDay());

        races.push({
          name, distance, location, link,
          date, prettyDate, isToday, isWeekend
        });
      });

      monthMap = {};
      races.sort((a, b) => a.date - b.date);
      races.forEach(race => {
        const raceMonth = race.date.toLocaleString('default', { month: 'long' });
        const raceYear = race.date.getFullYear();
        const groupKey = `${raceMonth} ${raceYear}`;

        if (!monthMap[groupKey]) monthMap[groupKey] = [];
        monthMap[groupKey].push(race);
      });

      render(); // refresh race grid
    });
}

function render(filteredRaces = monthMap) {
  container.innerHTML = "";
  Object.keys(filteredRaces).forEach(month => {
    if (filteredRaces[month].length === 0) return;

    const section = document.createElement("div");
    section.classList.add("month-section");
    section.innerHTML = `<div class="month-title">${month}</div><div class="race-grid"></div>`;

    const grid = section.querySelector(".race-grid");
    filteredRaces[month].forEach(race => {
      const div = document.createElement("div");
      div.className = "race-card";

      if (race.isToday) div.classList.add("today");
      else if (race.isWeekend) div.classList.add("weekend");
      else div.classList.add("weekday");

      div.innerHTML = `
        <div class="race-title">${race.name}</div>
        <div class="race-details">
          ${race.prettyDate} · ${race.location}<br>
          ${race.distance}<br>
          ${race.link ? `<a href="${race.link}" target="_blank">Event Info</a>` : ""}
        </div>
      `;
      grid.appendChild(div);
    });

    container.appendChild(section);
  });
}

// 🔍 Live search filter
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = {};
  Object.keys(monthMap).forEach(month => {
    filtered[month] = monthMap[month].filter(race =>
      race.name.toLowerCase().includes(term) ||
      race.location.toLowerCase().includes(term) ||
      race.distance.toLowerCase().includes(term)
    );
  });
  render(filtered);
});

// 🔄 Manual refresh button
document.getElementById("refresh-button").addEventListener("click", () => {
  loadRaces();
});

// 🔁 Optional auto-refresh every 2 minutes
// setInterval(loadRaces, 2 * 60 * 1000);

loadRaces(); // Initial page load
