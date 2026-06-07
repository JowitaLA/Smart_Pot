// Plik script.js odpowiedzialny jest za podstawowe parametry, implementacje funkcji fuzzy oraz ich analiz oraz start samego symulatora. 

// ZMIENNE GRY
// Czas
const seasons = ["winter", "spring", "summer", "autumn"]; // pory roku

let time = 8;       // godzina
let totalDay = 0;   // dzień
let seasonDay = 0;  // dzień w aktualnej porze roku

// Podstawowe parametry rośliny i doniczki
let season = "spring";  // aktualna pora roku
let plant = "storczyk"; // aktualna roślina

// Parametry do trybu własnego
let customSeasonActive = false;
let customSeasonConfig = {
  tempMin: -10,
  tempMax: 30,
  lightMin: 10,
  lightMax: 90,
  soilDrain: 0.5,
};

// Podstawowe parametry środowiska
let soil = 50;    // wilgotność gleby
let light = 50;   // światło
let temp = 20;    // temperatura
let health = 80;  // zdrowie rośliny (0-100)

let smartMode = false; // stan trybu SMART
let shutterActive = false;  // stan rolety

// POBIERANIE ELEMENTÓW
// Wiadomości
const msgState = document.getElementById("msgState");
const msgInfo = document.getElementById("msgInfo");
const msgSeason = document.getElementById("msgSeason");

// Tło
const sky = document.getElementById("sky");

// Select zmiennej do wykresu fuzzy
const chartVarSelect = document.getElementById("chartVar");

// Kontrolki nowych roślin
const healthNewPlant = document.getElementById("healthNewPlant");
const soilNewPlant = document.getElementById("soilNewPlant");
const lightNewPlant = document.getElementById("lightNewPlant");
const tempNewPlant = document.getElementById("tempNewPlant");

// Liczba dni
const days = document.getElementById("days");

// PARAMETRY ROŚLIN
const plantFuzzyConfig = {
  
storczyk: {
    soil: {
      xMax: 100,
      sets: [
        [0, 0, 15, 35],       // Suche - miękki lewy trapez
        [30, 50, 70],         // Optymalne - trójkąt
        [65, 80, 95, 100],    // Mokre - miękki prawy trapez
      ],
      labels: ["Suche", "Optymalne", "Mokre"],
      title: "Wilgotność gleby",
    },
    light: {
      xMax: 100,
      sets: [
        [0, 0, 15, 35],       // Ciemne
        [25, 50, 75],         // Optymalne
        [70, 85, 95, 100],    // Jasne
      ],
      labels: ["Ciemne", "Optymalne", "Jasne"],
      title: "Światło",
    },
    temp: {
      xMax: 40,
      sets: [
        [-25, -25, 5, 17],   // Zimno
        [16, 21, 27],         // Optymalne
        [25, 31, 40, 40],     // Gorąco
      ],
      labels: ["Zimno", "Optymalne", "Gorąco"],
      title: "Temperatura",
    },
  },

  kaktus: {
    soil: {
      xMax: 100,
      sets: [
        [0, 0, 8, 18],        // Suche
        [12, 25, 38],         // Optymalne
        [35, 50, 75, 100],    // Mokre
      ],
      labels: ["Suche", "Optymalne", "Mokre"],
      title: "Wilgotność gleby",
    },
    light: {
      xMax: 100,
      sets: [
        [0, 0, 15, 45],       // Ciemne
        [45, 70, 90],         // Optymalne
        [80, 92, 100, 100],   // Jasne
      ],
      labels: ["Ciemne", "Optymalne", "Jasne"],
      title: "Światło",
    },
    temp: {
      xMax: 40,
      sets: [
        [-25, -25, 10, 20],   // Zimno
        [18, 28, 35],         // Optymalne
        [32, 38, 40, 40],     // Gorąco
      ],
      labels: ["Zimno", "Optymalne", "Gorąco"],
      title: "Temperatura",
    },
  },

  paprotka: {
    soil: {
      xMax: 100,
      sets: [
        [0, 0, 35, 55],       // Suche
        [50, 65, 80],         // Optymalne
        [75, 85, 100, 100],   // Mokre
      ],
      labels: ["Suche", "Optymalne", "Mokre"],
      title: "Wilgotność gleby",
    },
    light: {
      xMax: 100,
      sets: [
        [0, 0, 10, 25],       // Ciemne
        [15, 30, 50],         // Optymalne
        [45, 60, 100, 100],   // Jasne
      ],
      labels: ["Ciemne", "Optymalne", "Jasne"],
      title: "Światło",
    },
    temp: {
      xMax: 40,
      sets: [
        [-25, -25, 10, 19],   // Zimno
        [18, 22, 27],         // Optymalne
        [25, 32, 40, 40],     // Gorąco
      ],
      labels: ["Zimno", "Optymalne", "Gorąco"],
      title: "Temperatura",
    },
  },
};

// PARAMETRY AKTYWNE ROŚLIN
const plantRateConfig = {
  storczyk: {
    soilDrain: 0.8,       //tempo zużywania wody
    tempAdaptation: 0.14, //adaptacja do temperatury
  },
  kaktus: {
    soilDrain: 0.4,
    tempAdaptation: 0.10,
  },
  paprotka: {
    soilDrain: 1.1,
    tempAdaptation: 0.16,
  },
};

// PARAMETRY PÓR ROKU
// Zakres temperatur dla pór roku
const seasonTempRanges = {
  winter: { min: -25, max: 5 },
  spring: { min: 0, max: 22 },
  summer: { min: 15, max: 40 },
  autumn: { min: 5, max: 15 },
};

// Harmonogram światła w ciągu dnia
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

// Tempo wysychania gleby zależne od sezonu
const seasonSoilDrain = {
  winter: 0.1,
  spring: 0.5,
  summer: 1.5,
  autumn: 0.25,
};

// FUNKCJE FUZZY
// Skrót do biblioteki fuzzy
const fuzzy = window.fuzzyLib;

// LOKALNE FUNKCJE PRZYNALEŻNOŚCI
//Funkcja trójkątna przynależności
function triangle(x, a, b, c) {
  x = Number(x);
  a = Number(a);
  b = Number(b);
  c = Number(c);

  if ([x, a, b, c].some(Number.isNaN)) return 0;

  // pojedynczy punkt
  if (a === b && b === c) return x === a ? 1 : 0;

  // lewe ramię: [a, a, c]
  if (a === b) {
    if (x <= b) return 1;
    if (x >= c) return 0;
    return (c - x) / (c - b);
  }

  // prawe ramię: [a, b, b]
  if (b === c) {
    if (x <= a) return 0;
    if (x >= b) return 1;
    return (x - a) / (b - a);
  }

  // zwykły trójkąt
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

//Funkcja trapezowa przynależności
function trapezoid(x, a, b, c, d) {
  x = Number(x);
  a = Number(a);
  b = Number(b);
  c = Number(c);
  d = Number(d);

  if ([x, a, b, c, d].some(Number.isNaN)) return 0;

  // punkty muszą być rosnące
  if (!(a <= b && b <= c && c <= d)) return 0;

  // poza zakresem
  if (x < a || x > d) return 0;

  // plateau
  if (x >= b && x <= c) return 1;

  // narastanie
  if (x >= a && x < b) {
    return a === b ? 1 : (x - a) / (b - a);
  }

  // opadanie
  if (x > c && x <= d) {
    return c === d ? 1 : (d - x) / (d - c);
  }

  return 0;
}

// Obliczanie przynależności dla dowolnego zbioru (triangle/trapezoid)
function evaluateSet(x, set) {
  if (!Array.isArray(set)) return 0;

  // 3 punkty = triangle / shoulder
  if (set.length === 3) {
    return triangle(x, set[0], set[1], set[2]);
  }

  // 4 punkty = trapez
  if (set.length === 4) {
    return trapezoid(x, set[0], set[1], set[2], set[3]);
  }

  return 0;
}

// Ograniczanie wartości do zakresu
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Pobranie aktualnych parametrów rośliny
function getPlantConfig() {
  return plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
}

// Cache zmiennych fuzzy zbudowanych z konfiguracji roślin
const fuzzyVariableCache = {};

// Tworzenie zakresu zmiennej (np. temp ma -25 start)
function getVariableDomain(variableName, config) {
  return [variableName === "temp" ? -25 : 0, config.xMax];
}

// Budowanie natywnego zbioru fuzzy dla biblioteki
function buildNativeFuzzySet(set) {
  if (!Array.isArray(set)) {
    return fuzzy.point(0);
  }

  // 3 punkty = triangle / shoulder
  if (set.length === 3) {
    const [a, b, c] = set;

    if (a === b && b === c) {
      return fuzzy.point(a);
    }
    if (a === b) {
      return fuzzy.invRamp(b, c);   // lewe ramię
    }
    if (b === c) {
      return fuzzy.ramp(a, b);      // prawe ramię
    }

    return fuzzy.triangle(a, b, c);
  }

  // 4 punkty = trapez / shoulder
  if (set.length === 4) {
    const [a, b, c, d] = set;

    if (a === b) {
      return fuzzy.invRamp(c, d);   // lewe ramię trapezowe
    }
    if (c === d) {
      return fuzzy.ramp(a, b);      // prawe ramię trapezowe
    }

    return fuzzy.trapezoid(a, b, c, d);
  }

  return fuzzy.point(0);
}

// Budowanie zmiennej fuzzy (z labelkami i zbiorami)
function buildFuzzyVariable(variableName, config) {
  const terms = Object.fromEntries(
    config.labels.map((label, index) => [
      label,
      buildNativeFuzzySet(config.sets[index]),
    ])
  );

  return fuzzy.variable(getVariableDomain(variableName, config), terms);
}

// Zwracanie zmiennej fuzzy z cache (lub tworzenie jej)
function getFuzzyVariable(variableName) {
  const key = `${plant}:${variableName}`;
  if (fuzzyVariableCache[key]) {
    return fuzzyVariableCache[key];
  }

  const config = getPlantConfig()[variableName];
  if (!config) return null;

  const fuzzyVar = buildFuzzyVariable(variableName, config);
  fuzzyVariableCache[key] = fuzzyVar;
  return fuzzyVar;
}

// ANALIZA PRZYNALEŻNOŚCI
// Zwracanie obiektu w stylu:
// { "Suche": 0.2, "Optymalne": 0.8, "Mokre": 0 }
function getMembershipMap(variableName, value) {
  const config = getPlantConfig()[variableName];
  if (!config) return {};

  const numericValue = Number(value);

  return Object.fromEntries(
    config.labels.map((label, index) => [
      label,
      evaluateSet(numericValue, config.sets[index]),
    ])
  );
}

// Zwracanie tablicy membershipów w kolejności zgodnej z `config.labels`
// np. [dry, optimal, wet]
function getMemberships(variableName, value) {
  const config = getPlantConfig()[variableName];
  if (!config) return [0, 0, 0];

  const membershipMap = getMembershipMap(variableName, value);
  return config.labels.map((label) => membershipMap[label] ?? 0);
}

// Zwracanie nazwy dominującego zbioru, np. "Optymalne"
function getDominantLabel(variableName, value, threshold = 0.02) {
  const config = getPlantConfig()[variableName];
  if (!config) return null;

  const memberships = getMemberships(variableName, value);
  const maxVal = Math.max(...memberships);

  if (maxVal < threshold) return null;
  return config.labels[memberships.indexOf(maxVal)];
}


// Wystawienie helperów globalnie 
// (przyda się do testów i w kolejnych plikach)
window.clamp = clamp;
window.getPlantConfig = getPlantConfig;
window.getFuzzyVariable = getFuzzyVariable;
window.getMembershipMap = getMembershipMap;
window.getMemberships = getMemberships;
window.getDominantLabel = getDominantLabel;

// START APLIKACJI
window.addEventListener("load", () => {
  resetHistory();
  updateUI();
});
