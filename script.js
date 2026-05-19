// ===== FUNKCJE PRZYNALEŻNOŚCI =====
export function triangle(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x == b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

// ===== ZMIENNE GRY =====
let time = 8; // czas 
let health = 20; // zdrowie rośliny

// ===== POBIERANIE ELEMENTÓW =====
const soil = document.getElementById("soil");
const light = document.getElementById("light");
const temp = document.getElementById("temp");
const msg = document.getElementById("msg");

// ===== UI =====
function updateUI() {
  document.getElementById("time").innerText = time;
  document.getElementById("health").innerText = Math.round(health);

  document.getElementById("soilVal").innerText = soil.value;
  document.getElementById("lightVal").innerText = light.value;
  document.getElementById("tempVal").innerText = temp.value;

  // Zmienna (pora dnia): dzień / noc
  let day = triangle(time, 6, 12, 18);
  document.body.style.background = day > 0.5 ? "#73abc1" : "#31374e";
}

// ===== FUZZY SYSTEM =====
export function step() {
  let s = parseInt(soil.value);     // wilgotność gleby
  let l = parseInt(light.value);    // światło
  let t = parseInt(temp.value);     // temperatura

  // ===== FUZZIFICATION =====
  let soilDry = triangle(s, 0, 0, 40);
  let soilWet = triangle(s, 60, 80, 100);

  let tempCold = triangle(t, 0, 0, 15);
  let tempHot = triangle(t, 25, 35, 40);

  let lightDark = triangle(l, 0, 0, 30);
  let lightBright = triangle(l, 60, 80, 100);

  let day = triangle(time, 6, 12, 18);
  let night = 1 - day;

  // ===== REGUŁY DLA DONICZKI =====
  // JEŚLI sucho I gorąco TO źle
  let rule1 = Math.min(soilDry, tempHot);

  // JEŚLI mokro I zimno TO źle
  let rule2 = Math.min(soilWet, tempCold);

  // JEŚLI ciemno I dzień TO źle
  let rule3 = Math.min(lightDark, day);

  // JEŚLI jasno I noc TO źle
  let rule4 = Math.min(lightBright, night);

  // ===== AGREGACJA =====
  let bad = Math.max(rule1, rule2, rule3, rule4);

  // ===== DECYZJA (DEFUZZYFIKACJA uproszczona) =====
  let change = -bad * 20 + 2; // kara + regeneracja

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
  time = (time + 1) % 24;

  updateUI();

  if (health <= 0) {
    alert("Roślina zwiędła");
  }

  if (health == 100) {
    alert("Roślina jest w idealnym stanie");
  }
}

// ===== AKCJE GRY =====
export function water() {
  soil.value = Math.min(100, parseInt(soil.value) + 20);
}

export function lamp() {
  light.value = Math.min(100, parseInt(light.value) + 20);
}

// ===== INIT =====
updateUI();

// ===== PODPIĘCIE DO OKNA =====
window.step = step;
window.water = water;
window.lamp = lamp;
