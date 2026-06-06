// Plik w którym znajdują się funkcje sterujące urządzeniami takimi jak:
// wentylator, zraszacz, pompa, lampa. 
// Odpowiadają za aktualizację stanu urządzeń, widokiem i logiką sterowania (smart/manual).

// SMART MODE //
function toggleSmartMode() {
  const enabling = !smartMode;
  smartMode = enabling;
  if (enabling) {
    // zapisz manualne tryby i wyłącz manualne tryby, SMART przejmuje kontrolę
    prevMoistureMode = moistureControlMode;
    prevTempMode = Object.assign({}, tempControlMode);
    prevLampMode = Object.assign({}, lampControlMode);

    moistureControlMode = "static";
    tempControlMode = { misting: false, ventilation: false };
    lampControlMode = { light: false, heat: false };
  } else {
    // przywróć poprzednie tryby manualne
    moistureControlMode = prevMoistureMode || "static";
    tempControlMode = prevTempMode || { misting: false, ventilation: false };
    lampControlMode = prevLampMode || { light: false, heat: false };
  }

  syncMoistureControl();
  syncTempControl();
  syncLampControl();
  updateUI();
}

// WIATRAK //
// Nawazanie, pompa i tryby
let moistureControlState = {
  watering: false,
  pumping: false,
};
let moistureControlMode = "static"; // static | watering | pumping
let prevMoistureMode = null;

// Wentylacja, zraszanie i tryby
let tempControlState = {
  misting: false,
  ventilation: false,
};
let tempControlMode = { misting: false, ventilation: false };
let prevTempMode = null;

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

// Tryb SMART dla nawodnienia - smart ma priorytet
function syncMoistureControl() {
  const currentSoil = Number(soil);

  // Jeśli smart jest ON, dążymy do środka zbioru 'Optymalne' (wartość b trójkąta)
  if (smartMode) {
    const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
    const optimalCenter = plantConfig.soil.sets[1][1];
    const margin = 1.5; // tolerancja wilgotności

    if (currentSoil < optimalCenter - margin) {
      moistureControlState.watering = true;
      moistureControlState.pumping = false;
    } else if (currentSoil > optimalCenter + margin) {
      moistureControlState.watering = false;
      moistureControlState.pumping = true;
    } else {
      moistureControlState.watering = false;
      moistureControlState.pumping = false;
    }
  // Jeśli smart jest OFF, używaj manual override (podlewanie/pompa działają od razu)
  } else if (moistureControlMode === "watering") {
    moistureControlState.watering = true;
    moistureControlState.pumping = false;
  } else if (moistureControlMode === "pumping") {
    moistureControlState.watering = false;
    moistureControlState.pumping = true;
  } else {
    moistureControlState.watering = false;
    moistureControlState.pumping = false;
  }

  updateMoistureVisuals();
}

// Tryb SMART dla wentylatora - smart ma priorytet
function syncTempControl() {
  const currentTemp = Number(temp);
  const currentSoil = Number(soil);
  const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
  const optimalTempCenter = plantConfig.temp.sets[1][1];
  const optimalSoilCenter = plantConfig.soil.sets[1][1];
  const tempMargin = 0.8;
  const soilMargin = 1.5;

  if (smartMode) {
    // Zraszacz działa gdy: temperatura za zimno/gorąco LUB za mało wody
    const tempExtreme = currentTemp < optimalTempCenter - tempMargin || currentTemp > optimalTempCenter + tempMargin;
    const soilTooLow = currentSoil < optimalSoilCenter - soilMargin;
    
    tempControlState.misting = tempExtreme || soilTooLow;
    tempControlState.ventilation = currentTemp > optimalTempCenter + tempMargin;
  } else if (tempControlMode.misting || tempControlMode.ventilation) {
    tempControlState.misting = !!tempControlMode.misting;
    tempControlState.ventilation = !!tempControlMode.ventilation;
  } else {
    tempControlState.misting = false;
    tempControlState.ventilation = false;
  }

  updateTempVisuals();
}

// Sterowanie temperaturą - smart ma priorytet
function applyTempControl() {
  let currentTemp = Number(temp);
  let currentSoil = Number(soil);

  if (smartMode) {
    const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
    const optimalCenter = plantConfig.temp.sets[1][1];
    const margin = 0.8;

    if (currentTemp > optimalCenter + margin) {
      currentTemp = Math.max(-50, currentTemp - 1);
      currentSoil = Math.max(0, currentSoil - 1);
    } else if (currentTemp < optimalCenter - margin) {
      currentSoil = Math.min(100, currentSoil + 1);
      currentTemp = Math.max(-50, currentTemp + 0.5);
    }
  } else if (tempControlMode.misting || tempControlMode.ventilation) {
    if (tempControlMode.misting) {
      currentSoil = Math.min(100, currentSoil + 2);
      currentTemp = Math.max(-50, currentTemp - 0.8);
    }
    if (tempControlMode.ventilation) {
      currentTemp = Math.max(-50, currentTemp - 1.8);
      currentSoil = Math.max(0, currentSoil - 1);
    }
  }

  temp = String(Number(currentTemp.toFixed(1)));
  soil = String(Math.round(currentSoil));

  syncTempControl();
  updateUI();
}

// Sterowanie zraszaniem - zmiana flagi, aplikacja w step()
function toggleMisting() {
  tempControlMode.misting = !tempControlMode.misting;
  syncTempControl();  // aktualizuj widok, nie aplikuj zmian od razu
}

// Sterowanie wentylacją - zmiana flagi, aplikacja w step()
function toggleVentilation() {
  tempControlMode.ventilation = !tempControlMode.ventilation;
  syncTempControl();  // aktualizuj widok, nie aplikuj zmian od razu
}

// Implementacja funkcji dla przycisków wentylatora i zraszacza
function windFan() { toggleVentilation(); }
function splatterFan() { toggleMisting(); }

// Eksport funkcji do globalnego scope dla przycisków HTML i innych modułów
function applyMoistureControl() {
  let currentSoil = Number(soil);

  // SMART ma priorytet: dążymy do środka optymalnego
  if (smartMode) {
    const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
    const optimalCenter = plantConfig.soil.sets[1][1];
    const margin = 1.5;
    const lowTarget = optimalCenter - margin;
    const highTarget = optimalCenter + margin;

    while (currentSoil < lowTarget) {
      currentSoil = Math.min(100, currentSoil + 1);
    }
    while (currentSoil > highTarget) {
      currentSoil = Math.max(0, currentSoil - 1);
    }

    soil = String(Math.round(currentSoil));
  // Manualne podlewanie/pompowanie działa natychmiast gdy SMART wyłączony
  } else if (moistureControlMode === "watering") {
    currentSoil = Math.min(100, currentSoil + 4);
    soil = String(Math.round(currentSoil));
  } else if (moistureControlMode === "pumping") {
    currentSoil = Math.max(0, currentSoil - 4);
    soil = String(Math.round(currentSoil));
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
let prevLampMode = null;

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

// Tryb SMART dla lampy - smart ma priorytet
function syncLampControl() {
  const currentLight = Number(light);
  const currentTemp = Number(temp);
  const plantConfig = plantFuzzyConfig[plant] || plantFuzzyConfig.storczyk;
  const lightSets = plantConfig.light.sets;
  const tempSets = plantConfig.temp.sets;

  const optimalLightCenter = lightSets[1][1];
  const optimalTempCenter = tempSets[1][1];
  const lightMargin = 6; // procentowe punkty
  const tempMargin = 0.8; // °C

  // Automatyczne sterowanie roletą przy włączonym SMART
  if (smartMode) {
    // Decyzję podejmujemy na podstawie surowej wartości "currentLight"
    // (zanim zastosowany zostanie efekt rolety). Zachowujemy stan,
    // jeśli jesteśmy w strefie tolerancji (histereza).
    let desiredShutter = shutterActive;
    if (currentLight > optimalLightCenter + lightMargin) {
      desiredShutter = true; // za jasno -> zasłoń roletę
    } else if (currentLight < optimalLightCenter - lightMargin) {
      desiredShutter = false; // za ciemno -> odsłoń roletę
    }
    if (desiredShutter !== shutterActive) {
      shutterActive = desiredShutter;
      const shutterEl = document.querySelector(".shutter");
      if (shutterEl) shutterEl.style.display = shutterActive ? "block" : "none";
    }
  }

  const shutterEffect = shutterActive ? 0.5 : 1.0;
  const effectiveLight = currentLight * shutterEffect;

  // Jeśli smart jest ON, dążymy do środka zbioru optymalnego (priorytet)
  if (smartMode) {
    lampControlState.light = effectiveLight < optimalLightCenter - lightMargin;
    lampControlState.heat = Number(currentTemp) < optimalTempCenter - tempMargin;
  } else if (lampControlMode.light || lampControlMode.heat) {
    lampControlState.light = !!lampControlMode.light;
    lampControlState.heat = !!lampControlMode.heat;
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

  // Zastosuj efekt rolety - zmniejsza światło o 50%
  let shutterEffect = shutterActive ? 0.5 : 1.0;  // 0.5 = 50% światła (50% zmniejszenie)

  // Jeśli smart jest ON, ma priorytet
  if (smartMode) {
    if (lampControlState.light) {
      currentLight = Math.min(100, currentLight + 26);
    }
    if (lampControlState.heat) {
      currentTemp = Math.min(100, currentTemp + 6);
    }
  // Jeśli smart jest OFF, używaj manual override
  } else if (lampControlMode.light || lampControlMode.heat) {
    if (lampControlMode.light) {
      currentLight = Math.min(100, currentLight + 8);
    }
    if (lampControlMode.heat) {
      currentTemp = Math.min(100, currentTemp + 1.5);
    }
  }

  // Aplikuj efekt rolety do światła
  currentLight = currentLight * shutterEffect;

  light = String(Math.round(currentLight));
  temp = String(Number(currentTemp.toFixed(1)));

  syncLampControl();
}

// Implementacja funkcji dla przycisków wentylatora i zraszacza
function lampLight() { toggleLight(); }
function lampHeater() { toggleHeater(); }

// Sterowanie światłem - zmiana flagi, aplikacja w step()
function toggleLight() {
  lampControlMode.light = !lampControlMode.light;
  syncLampControl();  // aktualizuj widok, nie aplikuj zmian od razu
}

// Sterowanie grzaniem - zmiana flagi, aplikacja w step()
function toggleHeater() {
  lampControlMode.heat = !lampControlMode.heat;
  syncLampControl();  // aktualizuj widok, nie aplikuj zmian od razu
}

// ROLETA //
function toggleShutter() {
  const shutter = document.querySelector(".shutter");
  shutterActive = !shutterActive;
  shutter.style.display = shutterActive ? "block" : "none";
  syncLampControl();  // aktualizuj sterowanie lampą
  updateUI();
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
