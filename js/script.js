// ZMIENNE GRY
// 1. Czas
const seasons = ["winter", "spring", "summer", "autumn"]; // pory roku

let time = 8;       // godzina
let totalDay = 0;   // dzień
let seasonDay = 0;  // dzień w aktualnej porze roku

// 2. Podstawowe parametry rośliny i doniczki
let season = "spring";  // aktualna pora roku
let plant = "storczyk"; // aktualna roślina (domyślnie storczyk, można zmieniać na kaktus lub paprotkę)

let soil = 50;    // wilgotność gleby
let light = 50;   // światło
let temp = 20;    // temperatura
let health = 80;  // zdrowie rośliny (0-100)

// Device control variables moved to js/actions.js
let smartMode = false;

// POBIERANIE ELEMENTÓW
// 1. Wiadomości
const msgState = document.getElementById("msgState");
const msgInfo = document.getElementById("msgInfo");
const msgSeason = document.getElementById("msgSeason");

// 2. Elementy interfejsu
const sky = document.getElementById("sky");

// 3. Wykresy rozmyte
const chartVarSelect = document.getElementById("chartVar");
const fuzzySoilChart = document.getElementById("fuzzySoil");
const fuzzyLightChart = document.getElementById("fuzzyLight");
const fuzzyTempChart = document.getElementById("fuzzyTemp");

// 4. Kontrolki nowych roślin
const healthNewPlant = document.getElementById("healthNewPlant");
const soilNewPlant = document.getElementById("soilNewPlant");
const lightNewPlant = document.getElementById("lightNewPlant");
const tempNewPlant = document.getElementById("tempNewPlant");

const days = document.getElementById("days");

// PARAMETRY ROŚLIN
const plantFuzzyConfig = {
  storczyk: {
    soil: {
      xMax: 100,
      sets: [
        [0, 0, 40],
        [30, 50, 70],
        [60, 80, 100],
      ],
      labels: ["Suche", "Optymalne", "Mokre"],
      title: "Wilgotność gleby",
    },
    light: {
      xMax: 100,
      sets: [
        [0, 0, 30],
        [20, 50, 80],
        [60, 80, 100],
      ],
      labels: ["Ciemne", "Optymalne", "Jasne"],
      title: "Światło",
    },
    temp: {
      xMax: 40,
      sets: [
        [0, 0, 15],
        [10, 20, 30],
        [25, 35, 40],
      ],
      labels: ["Zimno", "Optymalne", "Gorąco"],
      title: "Temperatura",
    },
  },
  kaktus: {
    soil: {
      xMax: 100,
      sets: [
        [0, 0, 20],
        [10, 30, 50],
        [40, 60, 100],
      ],
      labels: ["Suche", "Optymalne", "Mokre"],
      title: "Wilgotność gleby",
    },
    light: {
      xMax: 100,
      sets: [
        [0, 0, 50],
        [40, 70, 100],
        [80, 90, 100],
      ],
      labels: ["Ciemne", "Optymalne", "Jasne"],
      title: "Światło",
    },
    temp: {
      xMax: 50,
      sets: [
        [0, 0, 20],
        [15, 25, 35],
        [30, 40, 50],
      ],
      labels: ["Zimno", "Optymalne", "Gorąco"],
      title: "Temperatura",
    },
  },
  paprotka: {
    soil: {
      xMax: 100,
      sets: [
        [0, 0, 60],
        [50, 70, 90],
        [80, 90, 100],
      ],
      labels: ["Suche", "Optymalne", "Mokre"],
      title: "Wilgotność gleby",
    },
    light: {
      xMax: 100,
      sets: [
        [0, 0, 20],
        [10, 40, 70],
        [60, 80, 100],
      ],
      labels: ["Ciemne", "Optymalne", "Jasne"],
      title: "Światło",
    },
    temp: {
      xMax: 50,
      sets: [
        [0, 0, 18],
        [15, 25, 35],
        [30, 40, 50],
      ],
      labels: ["Zimno", "Optymalne", "Gorąco"],
      title: "Temperatura",
    },
  },
};

// FUNKCJE PRZYNALEŻNOŚCI
function triangle(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x == b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

soilNewPlant.addEventListener("input", updateUI);
lightNewPlant.addEventListener("input", updateUI);
tempNewPlant.addEventListener("input", updateUI);
healthNewPlant.addEventListener("input", updateUI);

days.addEventListener("input", updateUI);

chartVarSelect?.addEventListener("change", updateUI);

function getSoilFuzzyState(value) {
  const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
  const soilSets = plantConfig.soil.sets;

  return {
    dry: triangle(value, ...soilSets[0]),
    optimal: triangle(value, ...soilSets[1]),
    wet: triangle(value, ...soilSets[2]),
  };
}

// Wilgotność gleby: wyświetlanie powiadomień
// Device control functions moved to js/actions.js

function toggleSmartMode() {
  smartMode = !smartMode;
  if (!smartMode) {
    moistureControlMode = "static";
  }
  syncMoistureControl();
  updateUI();
}

// Parametry w doniczce
function step(timeStep) {
  for (let i = 0; i < timeStep; i++) {
    applyMoistureControl();
    applyTempControl();
    if (typeof applyLampControl === 'function') applyLampControl();

    let s = soil; // wilgotność gleby
    let l = light; // światło
    let t = temp; // temperatura

    // FUZZIFICATION
    let soilDry, soilOptimal, soilWet;
    let tempCold, tempOptimal, tempHot;
    let lightDark, lightOptimal, lightBright;

    const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
    const soilSets = plantConfig.soil.sets;
    const tempSets = plantConfig.temp.sets;
    const lightSets = plantConfig.light.sets;

    soilDry = triangle(s, ...soilSets[0]);
    soilOptimal = triangle(s, ...soilSets[1]);
    soilWet = triangle(s, ...soilSets[2]);

    tempCold = triangle(t, ...tempSets[0]);
    tempOptimal = triangle(t, ...tempSets[1]);
    tempHot = triangle(t, ...tempSets[2]);

    lightDark = triangle(l, ...lightSets[0]);
    lightOptimal = triangle(l, ...lightSets[1]);
    lightBright = triangle(l, ...lightSets[2]);

    let day = triangle(time, 6, 12, 18);
    let night = 1 - day;

    // REGUŁY DLA DONICZKI

    // Źle jeśli jest za sucho
    let rule1 = Math.min(soilDry);
    // Źle jeśli jest za mokro
    let rule2 = Math.min(soilWet);

    // Źle jeśli jest za gorąco
    let rule3 = Math.min(tempHot);
    // Źle jeśli jest za zimno
    let rule4 = Math.min(tempCold);

    // Źle jeśli jest ciemno w dzień
    let rule5 = Math.min(lightDark, day);
    // Źle jeśli jest jasno w noc
    let rule6 = Math.min(lightBright, night);

    // AGREGACJA
    let bad = Math.max(rule1, rule2, rule3, rule4, rule5, rule6);

    // DECYZJA
    let change = -bad * 10 + 1; // kara + regeneracja

    health += change;
    health = Math.max(0, Math.min(100, health));

    // KOMUNIKAT
    if (bad > 0.6) {
      msgState.innerText = "Warunki złe!";
      msgState.style.background = "#d9534f";
    } else if (bad > 0.3) {
      msgState.innerText = "Roślina w stresie";
      msgState.style.background = "#f0ad4e";
    } else {
      msgState.innerText = "Warunki dobre";
      msgState.style.background = "#5c832a";
    }

    // CZAS
    time = (time + 1) % 24;
    if (time === 0) {
      totalDay += 1;
      seasonDay += 1;

      const seasonLength = parseInt(days.value, 10) || 10;
      if (seasonDay >= seasonLength) {
        nextSeason();
      }
    }
    totalDay = Math.max(0, totalDay);
    totalDay = Math.min(totalDay, 999);
    updateHistory();
  }

  updateUI();

  if (health <= 0) {
    alert("Roślina zwiędła");
  }

  if (health == 100) {
    //alert("Roślina jest w idealnym stanie");
  }
}

// AKCJE GRY
function changePlant(newPlant) {
  plant = newPlant;

  health = parseInt(healthNewPlant.value, 10); // zdrowie rośliny
  soil = parseInt(soilNewPlant.value, 10); // wilgotność gleby
  light = parseInt(lightNewPlant.value, 10); // światło
  temp = parseInt(tempNewPlant.value, 10); // temperatura

  msgInfo.innerText = "Zmieniłeś roślinę na " + plant;
  msgInfo.style.background = "var(--primary-color)";

  updateUI();
}

// Automatyczna zmiana pory roku co days.value dni
function nextSeason() {
  const currentIndex = seasons.indexOf(season);
  if (currentIndex !== -1) {
    const nextIndex = (currentIndex + 1) % seasons.length;
    season = seasons[nextIndex];
    seasonDay = 0;
    msg.innerText = "Nastała pora roku: " + season;
    msgInfo.style.background = "var(--primary-color)";
  }
  updateUI();
}

// Zmiana pory roku (logika przycisku)
function changeSeason(newSeason) {
  season = newSeason;
  changePlant(plant); // reset rośliny do domyślnej przy zmianie pory roku

  time = 8; // czas
  totalDay = 0; // dzień
  seasonDay = 0; // reset liczby dni w sezonie
  msgSeason.innerText =
    "Zmieniono porę roku na " +
    season +
    ".\nKażda pora roku będzie wynosić " +
    days.value +
    " dni.";
  msgSeason.style.background = "var(--primary-color)";

  resetHistory();
  updateUI();
}

function toggleShutter() {
  const shutter = document.querySelector(".shutter");
  shutter.style.display = shutter.style.display === "block" ? "none" : "block";
  updateUI();
}

// INIT
window.addEventListener("load", () => {
  resetHistory();
  updateUI();
});

// PODPIĘCIE DO OKNA
window.step = step;
window.changePlant = changePlant;
// Actions (waterFan, pumpingFan, toggles) are provided by js/actions.js
