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
let shutterActive = false;  // stan rolety

// POBIERANIE ELEMENTÓW
// Wiadomości
const msgState = document.getElementById("msgState");
const msgInfo = document.getElementById("msgInfo");
const msgSeason = document.getElementById("msgSeason");

// Elementy interfejsu
const sky = document.getElementById("sky");

// Wykresy rozmyte
const chartVarSelect = document.getElementById("chartVar");
const fuzzySoilChart = document.getElementById("fuzzySoil");
const fuzzyLightChart = document.getElementById("fuzzyLight");
const fuzzyTempChart = document.getElementById("fuzzyTemp");

// Kontrolki nowych roślin
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
        [0, 0, 35],
        [30, 50, 70],
        [65, 80, 100],
      ],
      labels: ["Suche", "Optymalne", "Mokre"],
      title: "Wilgotność gleby",
    },
    light: {
      xMax: 100,
      sets: [
        [0, 0, 30],
        [25, 50, 75],
        [70, 85, 100],
      ],
      labels: ["Ciemne", "Optymalne", "Jasne"],
      title: "Światło",
    },
    temp: {
      xMax: 40,
      sets: [
        [-25, 0, 16],
        [14, 21, 28],
        [26, 33, 40],
      ],
      labels: ["Zimno", "Optymalne", "Gorąco"],
      title: "Temperatura",
    },
  },
  kaktus: {
    soil: {
      xMax: 100,
      sets: [
        [0, 0, 15],
        [10, 25, 40],
        [35, 60, 100],
      ],
      labels: ["Suche", "Optymalne", "Mokre"],
      title: "Wilgotność gleby",
    },
    light: {
      xMax: 100,
      sets: [
        [0, 0, 50],
        [45, 70, 90],
        [85, 100, 100],
      ],
      labels: ["Ciemne", "Optymalne", "Jasne"],
      title: "Światło",
    },
    temp: {
      xMax: 50,
      sets: [
        [-25, 0, 22],
        [18, 28, 35],
        [32, 45, 50],
      ],
      labels: ["Zimno", "Optymalne", "Gorąco"],
      title: "Temperatura",
    },
  },
  paprotka: {
    soil: {
      xMax: 100,
      sets: [
        [0, 0, 50],
        [45, 65, 85],
        [80, 90, 100],
      ],
      labels: ["Suche", "Optymalne", "Mokre"],
      title: "Wilgotność gleby",
    },
    light: {
      xMax: 100,
      sets: [
        [0, 0, 20],
        [15, 30, 50],
        [45, 70, 100],
      ],
      labels: ["Ciemne", "Optymalne", "Jasne"],
      title: "Światło",
    },
    temp: {
      xMax: 50,
      sets: [
        [-25, 0, 18],
        [16, 22, 28],
        [25, 35, 50],
      ],
      labels: ["Zimno", "Optymalne", "Gorąco"],
      title: "Temperatura",
    },
  },
};

const plantRateConfig = {
  storczyk: {
    soilDrain: 0.8,
    lightGain: 1.2,
    tempAdaptation: 0.14,
    seasonalBases: { spring: 12, summer: 22, autumn: 12, winter: 1 },
    seasonalAmplitudes: { spring: 8, summer: 10, autumn: 7, winter: 5 },
  },
  kaktus: {
    soilDrain: 0.4,
    lightGain: 1.6,
    tempAdaptation: 0.10,
    seasonalBases: { spring: 14, summer: 24, autumn: 14, winter: 3 },
    seasonalAmplitudes: { spring: 9, summer: 12, autumn: 8, winter: 6 },
  },
  paprotka: {
    soilDrain: 1.1,
    lightGain: 1.0,
    tempAdaptation: 0.16,
    seasonalBases: { spring: 11, summer: 21, autumn: 11, winter: 0 },
    seasonalAmplitudes: { spring: 7, summer: 9, autumn: 6, winter: 4 },
  },
};

// FUNKCJE PRZYNALEŻNOŚCI
function triangle(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x == b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

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

// INIT
window.addEventListener("load", () => {
  resetHistory();
  updateUI();
});
