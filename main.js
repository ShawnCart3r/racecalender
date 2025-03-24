const sheetURL = 'https://docs.google.com/spreadsheets/d/1H0pvW1hrIi3zCNPrIRN_oOKzN8Hw2RaY8vXERcmLiSU/gviz/tq?tqx=out:json&sheet=Sheet1';

const months = ["April", "May", "June", "July"];
const monthMap = {
  April: [],
  May: [],
  June: [],
  July: []
};

fetch(sheetURL)
  .then(res => res.text())
  .then(raw => {
    const json = JSON.parse(raw.substring(47).slice(0, -2));
    const rows = json.table.rows;

    rows.forEach(row => {
      const rawMonth = row.c[0]?.v || ""; // COLUMN A = Month
      const date = row.c[1]?.v || "";
      const name = row.c[2]?.v || "";
      const distance = row.c[3]?.v || "";
      const location = row.c[4]?.v || "";
      const link = row.c[5]?.v || "";

      // Normalize the month string
      const month = rawMonth.trim().charAt(0).toUpperCase() + rawMonth.trim().slice(1).toLowerCase();

      if (months.includes(month)) {
        monthMap[month].push({ date, name, distance, location, link });
      }
    });

    renderRaces();
  })
  .catch(error => {
    console.error("Error loading data from Google Sheets:", error);
    document.getElementById("race-grid").innerHTML = "<p>Could not load races.</p>";
  });

function renderRaces() {
  const container = document.getElementById("race-grid");
  months.forEach(month => {
    const box = document.createElement("div");
    box.classList.add("month-square");

    const title = document.createElement("div");
    title.classList.add("month-title");
    title.textContent = month;
    box.appendChild(title);

    if (monthMap[month].length === 0) {
      box.innerHTML += `<p>No races listed for ${month} yet.</p>`;
    } else {
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
    }

    container.appendChild(box);
  });
}