// ===== FUNKCJE PRZYNALEŻNOŚCI =====
export function triangle(x, a, b, c) {
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

// UI
function updateUI() {
  document.getElementById("time").innerText = time;
  document.getElementById("health").innerText = Math.round(health);

  document.getElementById("soilVal").innerText = soil.value;
  document.getElementById("lightVal").innerText = light.value;
  document.getElementById("tempVal").innerText = temp.value;

  // Dzień / noc
  let day = triangle(time, 6, 12, 18);
  document.body.style.background = day > 0.3 ? "#73abc1" : "#31374e";
}

// Parametry w doniczce
export function step(timeStep) {
  for (let i = 0; i < timeStep; i++) {
    let s = parseInt(soil.value); // wilgotność gleby
    let l = parseInt(light.value); // światło
    let t = parseInt(temp.value); // temperatura

    // FUZZIFICATION
    /*
    if (plant == "storczyk") {
      let soilDry = triangle(s, 0, 0, 40);
      let soilOptimal = triangle(s, 30, 50, 70);
      let soilWet = triangle(s, 60, 80, 100);

      let tempCold = triangle(t, 0, 0, 15);
      let tempOptimal = triangle(t, 10, 20, 30);
      let tempHot = triangle(t, 25, 35, 40);

      let lightDark = triangle(l, 0, 0, 30);
      let lightOptimal = triangle(l, 20, 50, 80);
      let lightBright = triangle(l, 60, 80, 100);
    } else if (plant == "kaktus") {
      let soilDry = triangle(s, 0, 0, 20);
      let soilOptimal = triangle(s, 10, 30, 50);
      let soilWet = triangle(s, 40, 60, 100);

      let tempCold = triangle(t, 0, 0, 20);
      let tempOptimal = triangle(t, 15, 25, 35);
      let tempHot = triangle(t, 30, 40, 50);

      let lightDark = triangle(l, 0, 0, 50);
      let lightOptimal = triangle(l, 40, 70, 100);
      let lightBright = triangle(l, 80, 90, 100);
    } else if (plant == "paprotka") {
      let soilDry = triangle(s, 0, 0, 60);
      let soilOptimal = triangle(s, 50, 70, 90);
      let soilWet = triangle(s, 80, 90, 100);

      let tempCold = triangle(t, 0, 0, 18);
      let tempOptimal = triangle(t, 15, 25, 35);
      let tempHot = triangle(t, 30, 40, 50);

      let lightDark = triangle(l, 0, 0, 20);
      let lightOptimal = triangle(l, 10, 40, 70);
      let lightBright = triangle(l, 60, 80, 100);
    } */

    let soilDry = triangle(s, 0, 0, 20);
    let soilOptimal = triangle(s, 10, 30, 50);
    let soilWet = triangle(s, 40, 60, 100);

    let tempCold = triangle(t, 0, 0, 20);
    let tempOptimal = triangle(t, 15, 25, 35);
    let tempHot = triangle(t, 30, 40, 50);

    let lightDark = triangle(l, 0, 0, 50);
    let lightOptimal = triangle(l, 40, 70, 100);
    let lightBright = triangle(l, 80, 90, 100);

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
    let change = -bad * 20 + 1; // kara + regeneracja

    health += change;
    health = Math.max(0, Math.min(100, health));

    // ===== KOMUNIKAT =====
    if (bad > 0.6) {
      msg.innerText = "Warunki złe!";
    } else if (bad > 0.3) {
      msg.innerText = "Roślina w stresie";
    } else {
      msg.innerText = "Warunki dobre";
    }

    // ===== CZAS =====
    time = (time + timeStep) % 24;
  }

  updateUI();

  if (health <= 0) {
    alert("Roślina zwiędła");
  }

  if (health == 100) {
    //alert("Roślina jest w idealnym stanie");
  }
}

// ===== AKCJE GRY =====

export function changePlant(newPlant) {
  plant = newPlant;
  let time = 8; // czas
  let health = 20; // zdrowie rośliny
  msg.innerText = "Zmieniłeś roślinę na " + plant;

  updateUI();
}

// ===== INIT =====
updateUI();

// ===== PODPIĘCIE DO OKNA =====
window.step = step;
window.nextDay = nextDay;

// window.water = water;
// window.lamp = lamp;
