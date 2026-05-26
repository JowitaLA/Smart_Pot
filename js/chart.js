// HISTORIA
const history = {
  time: [],
  health: [],
  soil: [],
  light: [],
  temp: [],
};
const maxHistory = 24; // ostatnie 24 godziny
const historyChart = document.getElementById("historyChart"); // id canvas dla wykresu historii
let historyChartInstance = null; // instancja Chart.js dla historii

// Fuzzy canvases
const fuzzySoil = document.getElementById("fuzzySoil");
const fuzzyLight = document.getElementById("fuzzyLight");
const fuzzyTemp = document.getElementById("fuzzyTemp");

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

function getFuzzyParams(variable) {
  const config = plantFuzzyConfig[plant]?.[variable];
  if (!config) {
    return {
      xMax: variable === "temp" ? 40 : 100,
      sets: [],
      labels: [],
      colors: ["#2c7bb6", "#abd9e9", "#fdae61"],
      title: "",
    };
  }

  return {
    xMax: config.xMax,
    sets: config.sets,
    labels: config.labels,
    colors: ["#2c7bb6", "#abd9e9", "#fdae61"],
    title: config.title,
  };
}

function drawFuzzyTemp() {
  if (!fuzzyTemp) return;
  const ctx = fuzzyTemp.getContext("2d");

  const variable = chartVarSelect?.value || "temp";
  const params = getFuzzyParams(variable);
  const width = fuzzyTemp.width;
  const height = fuzzyTemp.height;
  const padding = 30;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - 10, height - padding);
  ctx.lineTo(width - 10, 10);
  ctx.stroke();
  ctx.fillStyle = "#222";
  ctx.font = "12px Arial";
  ctx.fillText("0", padding - 5, height - padding + 14);
  ctx.fillText(params.xMax.toString(), width - 18, height - padding + 14);
  ctx.fillText(params.title, padding, 18);

  params.sets.forEach((set, idx) => {
    ctx.strokeStyle = params.colors[idx];
    ctx.beginPath();
    for (let x = 0; x <= params.xMax; x += 1) {
      const value = triangle(x, set[0], set[1], set[2]);
      const px = padding + ((width - padding - 15) * x) / params.xMax;
      const py = height - padding - value * (height - padding - 15);
      if (x === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    ctx.fillStyle = params.colors[idx];
    ctx.fillText(params.labels[idx], width - 80, 35 + idx * 16);
  });

  const currentValue = temp;
  const markerX =
    padding + ((width - padding - 15) * currentValue) / params.xMax;
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(markerX, height - padding);
  ctx.lineTo(markerX, 10);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#333";
  ctx.fillText(`${currentValue}°C`, markerX - 30, 28);
}

function drawFuzzySoil() {
  if (!fuzzySoil) return;

  const ctx = fuzzySoil.getContext("2d");
  const variable = chartVarSelect?.value || "soil";
  const params = getFuzzyParams(variable);
  const width = fuzzySoil.width;
  const height = fuzzySoil.height;
  const padding = 30;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - 10, height - padding);
  ctx.lineTo(width - 10, 10);
  ctx.stroke();

  ctx.fillStyle = "#222";
  ctx.font = "12px Arial";
  ctx.fillText("0", padding - 5, height - padding + 14);
  ctx.fillText(params.xMax.toString(), width - 18, height - padding + 14);
  ctx.fillText(params.title, padding, 18);

  params.sets.forEach((set, idx) => {
    ctx.strokeStyle = params.colors[idx];
    ctx.beginPath();

    for (let x = 0; x <= params.xMax; x += 1) {
      const value = triangle(x, set[0], set[1], set[2]);
      const px = padding + ((width - padding - 15) * x) / params.xMax;
      const py = height - padding - value * (height - padding - 15);

      if (x === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
    ctx.fillStyle = params.colors[idx];
    ctx.fillText(params.labels[idx], width - 80, 35 + idx * 16);
  });

  const currentValue =
    variable === "soil" ? soil : variable === "light" ? light : temp;
  const markerX =
    padding + ((width - padding - 15) * currentValue) / params.xMax;

  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(markerX, height - padding);
  ctx.lineTo(markerX, 10);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#333";
  ctx.fillText(
    `${currentValue}${variable === "temp" ? "°C" : ""}`,
    markerX - 15,
    28,
  );
}

function drawFuzzyLight() {
  if (!fuzzyLight) return;
  const ctx = fuzzyLight.getContext("2d");
  const variable = "light";
  const params = getFuzzyParams(variable);
  const width = fuzzyLight.width;
  const height = fuzzyLight.height;
  const padding = 30;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - 10, height - padding);
  ctx.lineTo(width - 10, 10);
  ctx.stroke();

  ctx.fillStyle = "#222";
  ctx.font = "12px Arial";
  ctx.fillText("0", padding - 5, height - padding + 14);
  ctx.fillText(params.xMax.toString(), width - 18, height - padding + 14);
  ctx.fillText(params.title, padding, 18);

  params.sets.forEach((set, idx) => {
    ctx.strokeStyle = params.colors[idx];
    ctx.beginPath();

    for (let x = 0; x <= params.xMax; x += 1) {
      const value = triangle(x, set[0], set[1], set[2]);
      const px = padding + ((width - padding - 15) * x) / params.xMax;
      const py = height - padding - value * (height - padding - 15);

      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.stroke();
    ctx.fillStyle = params.colors[idx];
    ctx.fillText(params.labels[idx], width - 80, 35 + idx * 16);
  });

  const currentValue = light;
  const markerX =
    padding + ((width - padding - 15) * currentValue) / params.xMax;
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(markerX, height - padding);
  ctx.lineTo(markerX, 10);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#333";
  ctx.fillText(`${currentValue}`, markerX - 15, 28);
}

function drawFuzzyChart() {
  drawFuzzySoil();
  drawFuzzyLight();
  drawFuzzyTemp();
}

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
          backgroundColor: "rgba(253,126,20,0.12)",
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
          align: "start",
          padding: { top: 10, bottom: 10 },
          text: "Historia",
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
          min: 0,
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
