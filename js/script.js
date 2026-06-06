// ZMIENNE GRY
// 1. Czas
const seasons = ["winter", "spring", "summer", "autumn"]; // pory roku

let time = 8;       // godzina
let totalDay = 0;   // dzień
let seasonDay = 0;  // dzień w aktualnej porze roku

// 2. Podstawowe parametry rośliny i doniczki
let season = "spring";  // aktualna pora roku
let plant = "storczyk"; // aktualna roślina (domyślnie storczyk, można zmieniać na kaktus lub paprotkę)

let customSeasonActive = false;
let customSeasonConfig = {
  tempMin: -10,
  tempMax: 30,
  lightMin: 10,
  lightMax: 90,
  soilDrain: 0.5,
};

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
  },
  kaktus: {
    soilDrain: 0.4,
    lightGain: 1.6,
    tempAdaptation: 0.10,
  },
  paprotka: {
    soilDrain: 1.1,
    lightGain: 1.0,
    tempAdaptation: 0.16,
  },
};

const seasonTempRanges = {
  winter: { min: -25, max: 5 },
  spring: { min: 0, max: 22 },
  summer: { min: 15, max: 40 },
  autumn: { min: 5, max: 15 },
};

const seasonLightSchedule = {
  winter: [
    { from: 0, to: 7, value: 0 },
    { from: 8, to: 8, value: 10 },
    { from: 9, to: 11, value: 25 },
    { from: 12, to: 12, value: 35 },
    { from: 13, to: 15, value: 25 },
    { from: 16, to: 16, value: 10 },
    { from: 17, to: 23, value: 0 },
  ],
  spring: [
    { from: 0, to: 5, value: 0 },
    { from: 6, to: 7, value: 20 },
    { from: 8, to: 11, value: 50 },
    { from: 12, to: 13, value: 70 },
    { from: 14, to: 17, value: 50 },
    { from: 18, to: 19, value: 20 },
    { from: 20, to: 23, value: 0 },
  ],
  summer: [
    { from: 0, to: 4, value: 0 },
    { from: 5, to: 5, value: 30 },
    { from: 6, to: 9, value: 70 },
    { from: 10, to: 14, value: 100 },
    { from: 15, to: 19, value: 70 },
    { from: 20, to: 21, value: 30 },
    { from: 22, to: 23, value: 0 },
  ],
  autumn: [
    { from: 0, to: 6, value: 0 },
    { from: 7, to: 8, value: 15 },
    { from: 9, to: 11, value: 40 },
    { from: 12, to: 12, value: 50 },
    { from: 13, to: 16, value: 40 },
    { from: 17, to: 18, value: 15 },
    { from: 19, to: 23, value: 0 },
  ],
};

const seasonSoilDrain = {
  winter: 0.1,
  spring: 0.5,
  summer: 1.5,
  autumn: 0.25,
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
