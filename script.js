// FUNKCJE PRZYNALEŻNOŚCI
function triangle(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x == b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

// ZMIENNE GRY
let time = 8; // czas
let health = 20; // zdrowie rośliny
let plant = "storczyk"; // podstawowa roślina

// POBIERANIE ELEMENTÓW
const soil = document.getElementById("soil");
const light = document.getElementById("light");
const temp = document.getElementById("temp");
const msg = document.getElementById("msg");
const chartVarSelect = document.getElementById("chartVar");
const fuzzySoilChart = document.getElementById("fuzzySoil");
const fuzzyLightChart = document.getElementById("fuzzyLight");
const fuzzyTempChart = document.getElementById("fuzzyTemp");

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

soil.addEventListener("input", updateUI);
light.addEventListener("input", updateUI);
temp.addEventListener("input", updateUI);
chartVarSelect?.addEventListener("change", updateUI);

// UI
function updateUI() {
  document.getElementById("time").innerText = time;
  document.getElementById("health").innerText = Math.round(health);

  document.getElementById("soilVal").innerText = soil.value;
  document.getElementById("lightVal").innerText = light.value;
  document.getElementById("tempVal").innerText = temp.value;

  // Dzień / noc
  let day = triangle(time, 6, 12, 18);
  //document.body.style.background = day > 0.3 ? "#73abc1" : "#57657b";

  drawFuzzyChart();
}

// Parametry w doniczce
function step(timeStep) {
  for (let i = 0; i < timeStep; i++) {
    let s = parseInt(soil.value); // wilgotność gleby
    let l = parseInt(light.value); // światło
    let t = parseInt(temp.value); // temperatura

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
      msg.innerText = "Warunki złe!";
    } else if (bad > 0.3) {
      msg.innerText = "Roślina w stresie";
    } else {
      msg.innerText = "Warunki dobre";
    }

    // CZAS 
    time = (time + 1) % 24;
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
  time = 8; // czas
  health = 20; // zdrowie rośliny
  msg.innerText = "Zmieniłeś roślinę na " + plant;

  resetHistory();
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
