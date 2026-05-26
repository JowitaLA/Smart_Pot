// FUNKCJE PRZYNALEŻNOŚCI
function triangle(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x == b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

// ZMIENNE GRY
const seasons = ["winter", "spring", "summer", "autumn"]; // pory roku

let time = 8; // czas
let totalDay = 0; // dzień
let seasonDay = 0;

let season = "spring"; // aktualna pora roku: summer | autumn | winter | spring
let plant = "storczyk"; // podstawowa roślina: storczyk | kaktus | paprotka
let smartEnabled = false;

let soil = 50; // wilgotność gleby
let light = 50; // światło
let temp = 20; // temperatura
let health = 80; // zdrowie rośliny

let moistureControlState = {
  watering: false,
  pumping: false,
};
let moistureControlMode = "static"; // static | watering | pumping

// POBIERANIE ELEMENTÓW
const msgState = document.getElementById("msgState");
const msgInfo = document.getElementById("msgInfo");
const msgSeason = document.getElementById("msgSeason");

const sky = document.getElementById("sky");
const chartVarSelect = document.getElementById("chartVar");

const fuzzySoilChart = document.getElementById("fuzzySoil");
const fuzzyLightChart = document.getElementById("fuzzyLight");
const fuzzyTempChart = document.getElementById("fuzzyTemp");

const soilNewPlant = document.getElementById("soilNewPlant");
const lightNewPlant = document.getElementById("lightNewPlant");
const tempNewPlant = document.getElementById("tempNewPlant");
const healthNewPlant = document.getElementById("healthNewPlant");

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

soilNewPlant.addEventListener("input", updateUI);
lightNewPlant.addEventListener("input", updateUI);
tempNewPlant.addEventListener("input", updateUI);
healthNewPlant.addEventListener("input", updateUI);

days.addEventListener("input", updateUI);

chartVarSelect?.addEventListener("change", updateUI);

// UI
function updateUI() {
  document.getElementById("time").innerText = time;
  document.getElementById("day").innerText = totalDay;
  document.getElementById("dayVal").innerText = days.value;

  document.getElementById("soilVal").innerText = soil;
  document.getElementById("lightVal").innerText = light;
  document.getElementById("tempVal").innerText = temp;
  document.getElementById("healthVal").innerText = health;

  document.getElementById("clockSeason").src = "img/clock/" + season + ".png";

  document.getElementById("soilNewPlantVal").innerText = soilNewPlant.value;
  document.getElementById("lightNewPlantVal").innerText = lightNewPlant.value;
  document.getElementById("tempNewPlantVal").innerText = tempNewPlant.value;
  document.getElementById("healthNewPlantVal").innerText = healthNewPlant.value;

  document.getElementById("plant").src =
    "img/pot/flowers/" +
    (plant == "storczyk" ? "orchid" : plant == "kaktus" ? "cactus" : "fern") +
    "_" +
    (health > 50 ? "good" : health > 30 ? "ok" : "bad") +
    ".png";

  const smartIcon = document.getElementById("potSmartOn");
  if (smartIcon) {
    smartIcon.style.display = smartEnabled ? "block" : "none";
  }

  syncMoistureControl();

  // Dzień / noc
  let day = triangle(time, 6, 12, 18);
  sky.style.background = day > 0.6 ? "#74bcd4" : day > 0.2 ? "#a46d08" : "#333";

  drawFuzzyChart();

  msgState.style.padding = "10px";
  msgInfo.style.padding = "10px";
  msgSeason.style.padding = "10px";

  let currentMsg = msgState.innerText;
  setTimeout(() => {
    if (msgState.innerText === currentMsg) {
      msgState.innerText = "";
      msgState.style.padding = "0px";
    }
  }, 3000);

  currentMsg = msgSeason.innerText;
  setTimeout(() => {
    if (msgSeason.innerText === currentMsg) {
      msgSeason.innerText = "";
      msgSeason.style.padding = "0px";
    }
  }, 3000);

  currentMsg = msgInfo.innerText;
  setTimeout(() => {
    if (msgInfo.innerText === currentMsg) {
      msgInfo.innerText = "";
      msgInfo.style.padding = "0px";
    }
  }, 3000);
}

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
function updateMoistureVisuals() {
  const wateringIcon = document.getElementById("fanWateringOn");
  const pumpingIcon = document.getElementById("fanPumpingOn");

  if (wateringIcon) {
    wateringIcon.style.display = moistureControlState.watering
      ? "block"
      : "none";
  }

  if (pumpingIcon) {
    pumpingIcon.style.display = moistureControlState.pumping ? "block" : "none";
  }
}

// Sterowanie wilgotnością gleby
function syncMoistureControl() {
  const currentSoil = soil;
  const { dry, optimal, wet } = getSoilFuzzyState(currentSoil);

  if (moistureControlMode === "watering") {
    moistureControlState.watering = true;
    moistureControlState.pumping = false;
  } else if (moistureControlMode === "pumping") {
    moistureControlState.watering = false;
    moistureControlState.pumping = true;
  } else if (smartEnabled && dry > wet && dry >= optimal && dry > 0.2) {
    moistureControlState.watering = true;
    moistureControlState.pumping = false;
  } else if (smartEnabled && wet > dry && wet >= optimal && wet > 0.2) {
    moistureControlState.watering = false;
    moistureControlState.pumping = true;
  } else {
    moistureControlState.watering = false;
    moistureControlState.pumping = false;
  }

  updateMoistureVisuals();
}

// Zastosowanie efektów sterowania wilgotnością gleby
function applyMoistureControl() {
  let currentSoil = soil;

  if (moistureControlMode === "watering") {
    currentSoil = Math.min(100, currentSoil + 4);
    soil = String(currentSoil);
  } else if (moistureControlMode === "pumping") {
    currentSoil = Math.max(0, currentSoil - 4);
    soil = String(currentSoil);
  } else if (smartEnabled) {
    const { dry, wet } = getSoilFuzzyState(currentSoil);

    if (wet > dry && wet > 0.2) {
      currentSoil = Math.max(0, currentSoil - 1);
    } else if (dry > wet && dry > 0.2) {
      currentSoil = Math.min(100, currentSoil + 1);
    }

    soil = String(currentSoil);
  }

  syncMoistureControl();
  updateUI();
}

function waterFan() {
  moistureControlMode =
    moistureControlMode === "watering" ? "static" : "watering";
  applyMoistureControl();
}

function pumpingFan() {
  moistureControlMode =
    moistureControlMode === "pumping" ? "static" : "pumping";
  applyMoistureControl();
}

function toggleSmartMode() {
  smartEnabled = !smartEnabled;
  if (!smartEnabled) {
    moistureControlMode = "static";
  }
  syncMoistureControl();
  updateUI();
}

// Parametry w doniczce
function step(timeStep) {
  for (let i = 0; i < timeStep; i++) {
    applyMoistureControl();

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
window.waterFan = waterFan;
window.pumpingFan = pumpingFan;
