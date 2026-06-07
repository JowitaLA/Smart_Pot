// Plik chart.js odpowiedzialny jest za wykresy i ich aktualizacje.

// HISTORIA
const history = {
  time: [],
  health: [],
  soil: [],
  light: [],
  temp: [],
};

const maxHistory = 24; // ostatnie 24 godziny
const historyChart = document.getElementById("historyChart");
let historyChartInstance = null;

// Fuzzy containers
const fuzzySoil = document.getElementById("fuzzySoil");
const fuzzyLight = document.getElementById("fuzzyLight");
const fuzzyTemp = document.getElementById("fuzzyTemp");

// HISTORIA PARAMETRÓW
function updateHistory() {
  if (history.time.length >= maxHistory) {
    history.time.shift();
    history.health.shift();
    history.soil.shift();
    history.light.shift();
    history.temp.shift();
  }

  history.time.push(time);
  history.health.push(health);
  history.soil.push(soil);
  history.light.push(light);
  history.temp.push(temp);

  updateHistoryChart();
}

function resetHistory() {
  history.time = [];
  history.health = [];
  history.soil = [];
  history.light = [];
  history.temp = [];
  updateHistory();
}

// FUZZY SVG HELPERS
function getCurrentVariableValue(variable) {
  if (variable === "soil") return Number(soil);
  if (variable === "light") return Number(light);
  if (variable === "temp") return Number(temp);
  return 0;
}

function getVariableTitle(variable) {
  if (variable === "soil") return "💧 Wilgotność 💧";
  if (variable === "light") return "☀️ Światło ☀️";
  if (variable === "temp") return "🌡️ Temperatura 🌡️";
  return variable;
}

function formatMembershipSummary(variable, value) {
  const config = getPlantConfig()[variable];
  if (!config) return "";

  const membershipMap = getMembershipMap(variable, value);

  return config.labels
    .map((label) => `${label}: ${(membershipMap[label] ?? 0).toFixed(2)}`)
    .join(" | ");
}

function getChartVariableDomain(variable) {
  const config = getPlantConfig()[variable];
  if (!config) {
    return {
      min: variable === "temp" ? -25 : 0,
      max: variable === "temp" ? 40 : 100,
    };
  }

  return {
    min: variable === "temp" ? -25 : 0,
    max: config.xMax,
  };
}

function getMarkerPercent(variable, value) {
  const domain = getChartVariableDomain(variable);
  const min = domain.min;
  const max = domain.max;

  if (max === min) return 0;

  return clamp(((Number(value) - min) / (max - min)) * 100, 0, 100);
}

function normalizeFuzzySvg(svgMarkup) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgMarkup, "image/svg+xml");
  const svgEl = svgDoc.querySelector("svg");

  if (!svgEl) return svgMarkup;

  // Jeśli SVG ma width/height, zamieniamy to na viewBox,
  // żeby później dało się je skalować dowolnie CSS-em.
  const w = svgEl.getAttribute("width");
  const h = svgEl.getAttribute("height");

  if (!svgEl.getAttribute("viewBox") && w && h) {
    const widthNum = parseFloat(w);
    const heightNum = parseFloat(h);

    if (!Number.isNaN(widthNum) && !Number.isNaN(heightNum)) {
      svgEl.setAttribute("viewBox", `0 0 ${widthNum} ${heightNum}`);
    }
  }

  // Usuń sztywne width/height
  svgEl.removeAttribute("width");
  svgEl.removeAttribute("height");

  // "none" = SVG ma się dopasować do boxa kosztem zniekształcenia
  svgEl.setAttribute("preserveAspectRatio", "none");

  svgEl.classList.add("fuzzy-generated-svg");

  return svgEl.outerHTML;
}

function renderFuzzySvg(container, variable) {
  if (!container) return;

  if (
    !window.fuzzyVizLib ||
    typeof window.fuzzyVizLib.varToSvg !== "function"
  ) {
    container.innerHTML = `
      <div class="fuzzy-info">
        <strong>Błąd:</strong> @thi.ng/fuzzy-viz nie zostało załadowane.
      </div>
    `;
    return;
  }

  const fuzzyVar = getFuzzyVariable(variable);
  const currentValue = getCurrentVariableValue(variable);
  const dominantLabel = getDominantLabel(variable, currentValue) || "brak";
  const summary = formatMembershipSummary(variable, currentValue);

  if (!fuzzyVar) {
    container.innerHTML = `
      <div class="fuzzy-info">
        <strong>Błąd:</strong> brak definicji zmiennej fuzzy dla "${variable}".
      </div>
    `;
    return;
  }

  let svgMarkup = "";

  try {
    const svg = window.fuzzyVizLib.varToSvg(fuzzyVar, { samples: 200 });
    const rawSvg = typeof svg === "string" ? svg : String(svg);

    // normalizujemy SVG przed wstawieniem do DOM
    svgMarkup = normalizeFuzzySvg(rawSvg);
  } catch (err) {
    console.error("Błąd generowania SVG fuzzy:", variable, err);
    container.innerHTML = `
    <div class="fuzzy-info">
      <strong>Błąd renderowania wykresu fuzzy:</strong> ${variable}
    </div>
  `;
    return;
  }

  const markerPercent = getMarkerPercent(variable, currentValue);

  container.innerHTML = `
    <div class="fuzzy-card">
      <div class="fuzzy-title">
              ${getVariableTitle(variable)}
      </div>
      <div class="fuzzy-plot">
        <div class="fuzzy-svg-wrap">
          ${svgMarkup}

          <div class="fuzzy-marker" style="left: ${markerPercent}%"></div>
          <div class="fuzzy-marker-label" style="left: ${markerPercent}%">
            ${currentValue}${variable === "temp" ? "°C" : ""}
          </div>
        </div>
      </div>

      <div class="fuzzy-info">
        <div><strong>Stan:</strong> ${dominantLabel}</div>
        <div>${summary}</div>
      </div>
    </div>
  `;

  const svgEl = container.querySelector("svg");
  if (!svgEl) {
    console.warn(`Brak elementu <svg> w renderze dla: ${variable}`, svgMarkup);
  }
}

function drawFuzzySoil() {
  renderFuzzySvg(fuzzySoil, "soil");
}

function drawFuzzyLight() {
  renderFuzzySvg(fuzzyLight, "light");
}

function drawFuzzyTemp() {
  renderFuzzySvg(fuzzyTemp, "temp");
}

function drawFuzzyChart() {
  drawFuzzySoil();
  drawFuzzyLight();
  drawFuzzyTemp();
}

// HISTORIA
function initHistoryChart() {
  if (!historyChart || typeof Chart === "undefined") return;

  const ctx = historyChart.getContext("2d");
  historyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: history.time.map((hour) => `${hour}:00`),
      datasets: [
        {
          label: "Zdrowie",
          data: history.health,
          borderColor: "#28a745",
          backgroundColor: "rgba(40,167,69,0.12)",
          fill: true,
          tension: 0.2,
          pointBackgroundColor: "#28a745",
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 3,
        },
        {
          label: "Nawodnienie",
          data: history.soil,
          borderColor: "#007bff",
          backgroundColor: "rgba(0,123,255,0.12)",
          fill: true,
          tension: 0.2,
          pointBackgroundColor: "#007bff",
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 3,
        },
        {
          label: "Światło",
          data: history.light,
          borderColor: "#fd7e14",
          backgroundColor: "rgba(203, 195, 189, 0.12)",
          fill: true,
          tension: 0.2,
          pointBackgroundColor: "#fd7e14",
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 3,
        },
        {
          label: "Temperatura",
          data: history.temp,
          borderColor: "#dc3545",
          backgroundColor: "rgba(220,53,69,0.12)",
          fill: true,
          tension: 0.2,
          pointBackgroundColor: "#dc3545",
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 3,
          yAxisID: "tempAxis",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: "top",
          align: "end",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 3,
            boxHeight: 3,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          boxPadding: 6,
        },
        title: {
          display: true,
          position: "top",
          align: "center",
          padding: { top: 10, bottom: 10 },
          text: "⏳ Historia ⏳",
        },
      },
      layout: {
        padding: {
          left: 30,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "Parametry",
          },
        },
        tempAxis: {
          type: "linear",
          display: false,
          position: "right",
          min: -25,
          max: 40,
        },
      },
    },
  });
}

function updateHistoryChart() {
  if (!historyChartInstance) {
    initHistoryChart();
    return;
  }

  historyChartInstance.data.labels = history.time.map((hour) => `${hour}:00`);
  historyChartInstance.data.datasets[0].data = history.health;
  historyChartInstance.data.datasets[1].data = history.soil;
  historyChartInstance.data.datasets[2].data = history.light;
  historyChartInstance.data.datasets[3].data = history.temp;
  historyChartInstance.update();
}
