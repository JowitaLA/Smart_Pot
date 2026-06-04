// Plik w którym znajdują się funkcje sterujące urządzeniami takimi jak:
// wentylator, zraszacz, pompa, lampa. 
// Odpowiadają za aktualizację stanu urządzeń, widokiem i logiką sterowania (smart/manual).


// WIATRAK //
// Nawazanie, pompa i tryby
let moistureControlState = {
  watering: false,
  pumping: false,
};
let moistureControlMode = "static"; // static | watering | pumping

// Wentylacja, zraszanie i tryby
let tempControlState = {
  misting: false,
  ventilation: false,
};
let tempControlMode = { misting: false, ventilation: false };

// INFO
// Aktualizacje ikon dla nawodnienia
function updateMoistureVisuals() {
  const wateringIcon = document.getElementById("fanWateringOn");
  const pumpingIcon = document.getElementById("fanPumpingOn");

  if (wateringIcon) wateringIcon.style.display = moistureControlState.watering ? "block" : "none";
  if (pumpingIcon) pumpingIcon.style.display = moistureControlState.pumping ? "block" : "none";
}

// Aktualizacje ikon dla wentylatora
function updateTempVisuals() {
  const mistingIcon = document.getElementById("fanSplatterOn");
  const ventilationIcon = document.getElementById("fanWindOn");

  if (mistingIcon) mistingIcon.style.display = tempControlState.misting ? "block" : "none";
  if (ventilationIcon) ventilationIcon.style.display = tempControlState.ventilation ? "block" : "none";

  const fanWindEl = document.getElementById("fanWind");
  const fanSplatterEl = document.getElementById("fanSplatter");
  if (fanWindEl) fanWindEl.classList.toggle("visible", tempControlState.ventilation);
  if (fanSplatterEl) fanSplatterEl.classList.toggle("visible", tempControlState.misting);
}

// Tryb SMART dla nawodnienia
function syncMoistureControl() {
  const currentSoil = soil;
  // Pobierz wartości rozmyte dla wilgotności gleby
  const { dry, optimal, wet } = getSoilFuzzyState(currentSoil);

  // Jeżeli jest podlewanie, nie odpompowywuj wody.
  if (moistureControlMode === "watering") {
    moistureControlState.watering = true;
    moistureControlState.pumping = false;
  // Jeżeli jest odpompowywanie, nie podlewaj.
  } else if (moistureControlMode === "pumping") {
    moistureControlState.watering = false;
    moistureControlState.pumping = true;
  // Tryb smart: podlewaj jeśli jest sucho.
  } else if (smartMode && dry > wet && dry >= optimal && dry > 0.2) {
    moistureControlState.watering = true;
    moistureControlState.pumping = false;
  // Tryb smart: odpompowywuj jeśli jest za mokro.
  } else if (smartMode && wet > dry && wet >= optimal && wet > 0.2) {
    moistureControlState.watering = false;
    moistureControlState.pumping = true;
  // Tryb smart: wyłącz wszystkie funkcje gdy w normie.
  } else {
    moistureControlState.watering = false;
    moistureControlState.pumping = false;
  }

  updateMoistureVisuals();
}

// Tryb SMART dla wentylatora
function syncTempControl() {
  const currentTemp = temp;
  // Pobierz wartości rozmyte dla temperatury
  const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
  const tempSets = plantConfig.temp.sets;

  // Oblicz wartości rozmyte dla temperatury
  const cold = triangle(currentTemp, ...tempSets[0]);
  const optimal = triangle(currentTemp, ...tempSets[1]);
  const hot = triangle(currentTemp, ...tempSets[2]);

  // Jeżeli jest zraszanie lub wentylacja, nie zmieniaj innych funkcji.
  if (tempControlMode.misting || tempControlMode.ventilation) {
    tempControlState.misting = !!tempControlMode.misting;
    tempControlState.ventilation = !!tempControlMode.ventilation;
  // Tryb smart: włącz zraszanie jeśli jest za gorąco.
  } else if (smartMode) {
    tempControlState.misting = cold >= 0.2 && cold > hot && cold >= optimal;
    tempControlState.ventilation = hot >= 0.2 && hot > cold && hot >= optimal;
  // Tryb smart: wyłącz wszystkie funkcje gdy w normie.
  } else {
    tempControlState.misting = false;
    tempControlState.ventilation = false;
  }

  // Aktualizuj widok wentylatora i zraszacza
  updateTempVisuals();
}

// Pobierz wartości rozmyte dla wilgotności gleby
function applyTempControl() {
  // Pobierz aktualne wartości temperatury i wilgotności gleby
  let currentTemp = Number(temp);
  let currentSoil = Number(soil);

  if (tempControlMode.misting || tempControlMode.ventilation) {
    // Manualne sterowanie: 
    // zraszanie obniża temperaturę i lekko zwiększa wilgotność, 
    // wentylacja obniża temperaturę i lekko zmniejsza wilgotność.
    if (tempControlMode.misting) {
      currentSoil = Math.min(100, currentSoil + 2);
      currentTemp = Math.max(-50, currentTemp - 0.8);
    }

    // Wentylacja jest silniejsza niż zraszanie, 
    // więc obniża temperaturę bardziej i lekko zmniejsza wilgotność.
    if (tempControlMode.ventilation) {
      currentTemp = Math.max(-50, currentTemp - 1.8);
      currentSoil = Math.max(0, currentSoil - 1);
    }
  // Tryb smart
  } else if (smartMode) {
    const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
    const tempSets = plantConfig.temp.sets;
    const cold = triangle(currentTemp, ...tempSets[0]);
    const hot = triangle(currentTemp, ...tempSets[2]);
    // Jeśli jest za gorąco, włącz zraszanie i wentylację, 
    // które obniżą temperaturę i lekko zmienią wilgotność.
    if (hot > cold && hot > 0.2) {
      currentTemp = Math.max(-50, currentTemp - 1);
      currentSoil = Math.max(0, currentSoil - 1);
    }

    // Jeśli jest za zimno, wyłącz zraszanie i wentylację,
    // które pozwolą temperaturze lekko wzrosnąć i lekko zmienią wilgotność.
    if (cold > hot && cold > 0.2) {
      currentSoil = Math.min(100, currentSoil + 1);
      currentTemp = Math.max(-50, currentTemp + 0.5);
    }
  }
  // Aktualizuj globalne zmienne i widok
  temp = String(Number(currentTemp.toFixed(1)));
  soil = String(Math.round(currentSoil));

  syncTempControl();
  updateUI();
}

// Sterowanie zraszaniem
function toggleMisting() {
  tempControlMode.misting = !tempControlMode.misting;
  applyTempControl();
}

// Sterowanie wentylacją
function toggleVentilation() {
  tempControlMode.ventilation = !tempControlMode.ventilation;
  applyTempControl();
}

// Implementacja funkcji dla przycisków wentylatora i zraszacza
function windFan() { toggleVentilation(); }
function splatterFan() { toggleMisting(); }

// Eksport funkcji do globalnego scope dla przycisków HTML i innych modułów
function applyMoistureControl() {
  let currentSoil = Number(soil);

  // Manualne sterowanie: podlewanie zwiększa wilgotność.
  if (moistureControlMode === "watering") {
    currentSoil = Math.min(100, currentSoil + 4);
    soil = String(currentSoil);
  // Manualne sterowanie: pompa zmniejsza wilgotność.
  } else if (moistureControlMode === "pumping") {
    currentSoil = Math.max(0, currentSoil - 4);
    soil = String(currentSoil);

  // Tryb smart
  } else if (smartMode) {
    const { dry, wet } = getSoilFuzzyState(currentSoil);
    // Jeśli jest za sucho, podlewaj.
    if (wet > dry && wet > 0.2) {
      currentSoil = Math.max(0, currentSoil - 1);

    // Jeśli jest za mokro, odpompowuj.
    } else if (dry > wet && dry > 0.2) {
      currentSoil = Math.min(100, currentSoil + 1);
    }

    // Aktualizuj globalną zmienną i widok
    soil = String(currentSoil);
  }
  // Aktualizuj widok nawodnienia
  syncMoistureControl();
  updateUI();
}

// Pobierz wartości rozmyte dla wilgotności gleby (podlewanie)
function waterFan() {
  moistureControlMode = moistureControlMode === "watering" ? "static" : "watering";
  applyMoistureControl();
}

// Pobierz wartości rozmyte dla wilgotności gleby (odpompowywanie)
function pumpingFan() {
  moistureControlMode = moistureControlMode === "pumping" ? "static" : "pumping";
  applyMoistureControl();
}






// LAMPA //
// Sterowanie lampą i tryby
let lampControlState = {
  light: false,
  heat: false,
};
let lampControlMode = { light: false, heat: false };

// Aktualizacje ikon dla lampy
function updateLampVisuals() {
  const lightOn = document.getElementById("lampLightOn");
  const heatOn = document.getElementById("lampHeaterOn");
  if (lightOn) lightOn.classList.toggle("visible", lampControlState.light);
  if (heatOn) heatOn.classList.toggle("visible", lampControlState.heat);

  const lampLightEl = document.getElementById("lampLight");
  const lampHeaterEl = document.getElementById("lampHeater");
  if (lampLightEl) lampLightEl.classList.toggle("visible", lampControlState.light);
  if (lampHeaterEl) lampHeaterEl.classList.toggle("visible", lampControlState.heat);
}

// Tryb SMART dla lampy
function syncLampControl() {
  const currentLight = light;
  const currentTemp = temp;
  const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
  const lightSets = plantConfig.light.sets;
  const tempSets = plantConfig.temp.sets;

  const lightDark = triangle(currentLight, ...lightSets[0]);
  const tempCold = triangle(currentTemp, ...tempSets[0]);

  if (lampControlMode.light !== false || lampControlMode.heat !== false) {
    lampControlState.light = !!lampControlMode.light;
    lampControlState.heat = !!lampControlMode.heat;
  } else if (smartMode) {
    // Smart heuristics: if dark -> light on; if cold -> heater on. Both can be on.
    lampControlState.light = lightDark >= 0.4;
    lampControlState.heat = tempCold >= 0.4;
  } else {
    lampControlState.light = false;
    lampControlState.heat = false;
  }

  updateLampVisuals();
}

// Sterowanie światłem
function applyLampControl() {
  let currentLight = Number(light);
  let currentTemp = Number(temp);

  if (lampControlMode.light || lampControlMode.heat) {
    // Manualne sterowanie: gdy światło włączone, zwiększ jasność.
    if (lampControlMode.light) {
      currentLight = Math.min(100, currentLight + 8);
    }
    // Manualne sterowanie: gdy grzanie włączone, zwiększ temperaturę.
    if (lampControlMode.heat) {
      currentTemp = Math.min(100, currentTemp + 1.5);
    }
  // Tryb smart: włącz światło jeśli jest ciemno.
  } else if (smartMode) {
    if (lampControlState.light) {
      currentLight = Math.min(100, currentLight + 6);
    }
    // Tryb smart: włącz grzanie jeśli jest zimno.
    if (lampControlState.heat) {
      currentTemp = Math.min(100, currentTemp + 1);
    }
  }

  light = String(Math.round(currentLight));
  temp = String(Number(currentTemp.toFixed(1)));

  syncLampControl();
  updateUI();
}

// Implementacja funkcji dla przycisków wentylatora i zraszacza
function lampLight() { toggleLight(); }
function lampHeater() { toggleHeater(); }

// Sterowanie światłem
function toggleLight() {
  lampControlMode.light = !lampControlMode.light;
  applyLampControl();
}

// Sterowanie grzaniem
function toggleHeater() {
  lampControlMode.heat = !lampControlMode.heat;
  applyLampControl();
}






// Eksport funkcji do globalnego scope dla przycisków HTML i innych modułów
window.syncMoistureControl = syncMoistureControl;
window.syncTempControl = syncTempControl;

window.applyMoistureControl = applyMoistureControl;
window.applyTempControl = applyTempControl;

window.waterFan = waterFan;
window.pumpingFan = pumpingFan;

window.toggleMisting = toggleMisting;
window.toggleVentilation = toggleVentilation;

window.windFan = windFan;
window.splatterFan = splatterFan;

window.syncLampControl = syncLampControl;
window.applyLampControl = applyLampControl;

window.toggleLight = toggleLight;
window.toggleHeater = toggleHeater;

window.lampLight = lampLight;
window.lampHeater = lampHeater;
