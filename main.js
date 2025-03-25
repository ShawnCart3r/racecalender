const sheetURL = 'https://docs.google.com/spreadsheets/d/1H0pvW1hrIi3zCNPrIRN_oOKzN8Hw2RaY8vXERcmLiSU/gviz/tq?tqx=out:json&sheet=Sheet1';

const allMonthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let months = [];
const today = new Date();

fetch(sheetURL)
  .then(res => res.text())
  .then(raw => {
    const json = JSON.parse(raw.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const allRaces = [];

    rows.forEach(row => {
      const rawMonth = row.c[0]?.v || "";
      const date = row.c[1]?.v || "";
      const name = row.c[2]?.v || "";
      const distance = row.c[3]?.v || "";
      const location = row.c[4]?.v || "";
      const link = row.c[5]?.v || "";

      if (!date) return;

      const raceDate = new Date(date);
      const month = rawMonth.trim().charAt(0).toUpperCase() + rawMonth.trim().slice(1).toLowerCase();

      allRaces.push({ month, date, name, distance, location, link, raceDate });
    });

    // Sort races by date
    allRaces.sort((a, b) => a.raceDate - b.raceDate);

    const latestRace = allRaces[allRaces.length - 1];
    const latestMonthIndex = allMonthNames.indexOf(latestRace.month);

    // Decide the start index
    const startMonthIndex = today > latestRace.raceDate
      ? (latestMonthIndex + 1) % 12
      : today.getMonth();

    // Define the next 4 months
    months = [];
    for (let i = 0; i < 6; i++) { // check 6 ahead in case March is skipped
      const monthName = allMonthNames[(startMonthIndex + i) % 12];
      if (monthName !== "March" && months.length < 4) {
        months.push(monthName);
      }
    }

    // Build monthMap
    const monthMap = {};
    months.forEach(month => {
      monthMap[month] = [];
    });

    allRaces.forEach(race => {
      if (months.includes(race.month)) {
        monthMap[race.month].push(race);
      }
    });

    renderRaces(monthMap, months);
  })
  .catch(error => {
    console.error("Error loading data from Google Sheets:", error);
    document.getElementById("race-grid").innerHTML = "<p>Could not load races.</p>";
  });

function renderRaces(monthMap, months) {
  const container = document.getElementById("race-grid");
  container.innerHTML = ""; // Clear previous entries

  months.forEach(month => {
    if (monthMap[month].length === 0) return;

    const box = document.createElement("div");
    box.classList.add("month-square");

    const title = document.createElement("div");
    title.classList.add("month-title");
    title.textContent = month;
    box.appendChild(title);

    monthMap[month].forEach(race => {
      const raceDiv = document.createElement("div");
      raceDiv.classList.add("race");
      raceDiv.innerHTML = `
        <div class="race-title">${race.name}</div>
        <div class="race-details">
          ${race.date} · ${race.location}<br>
          ${race.distance ? `${race.distance} · ` : ""}
          ${race.link ? `<a href="${race.link}" target="_blank">Event Info</a>` : ""}
        </div>
      `;
      box.appendChild(raceDiv);
    });

    container.appendChild(box);
  });
}
