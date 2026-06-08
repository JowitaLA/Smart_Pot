// Plik actions.js to miejsce w którym znajdują się funkcje sterujące urządzeniami takimi jak:
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

  if (wateringIcon)
    wateringIcon.style.display = moistureControlState.watering
      ? "block"
      : "none";
  if (pumpingIcon)
    pumpingIcon.style.display = moistureControlState.pumping ? "block" : "none";
}

// Aktualizacje ikon dla wentylatora
function updateTempVisuals() {
  const mistingIcon = document.getElementById("fanSplatterOn");
  const ventilationIcon = document.getElementById("fanWindOn");

  if (mistingIcon)
    mistingIcon.style.display = tempControlState.misting ? "block" : "none";
  if (ventilationIcon)
    ventilationIcon.style.display = tempControlState.ventilation
      ? "block"
      : "none";

  const fanWindEl = document.getElementById("fanWind");
  const fanSplatterEl = document.getElementById("fanSplatter");
  if (fanWindEl)
    fanWindEl.classList.toggle("visible", tempControlState.ventilation);
  if (fanSplatterEl)
    fanSplatterEl.classList.toggle("visible", tempControlState.misting);
}

// Tryb SMART dla nawodnienia - smart ma priorytet
function syncMoistureControl() {
  const currentSoil = Number(soil);

  if (smartMode) {
    // Pobieramy stopnie przynależności fuzzy dla wilgotności gleby:
    // [Suche, Optymalne, Mokre]
    const [dry, optimal, wet] = getMemberships("soil", currentSoil);

    // Dodanie defuzyfikacji
    // const decision = (dry * 0 + optimal * 0.5 + wet * 1) / (dry + optimal + wet);

    // Logika
    // moistureControlState.watering = decision < -0.1;
    // moistureControlState.pumping  = decision > 0.1

    // Jeśli roślina jest bardziej "sucha" niż "mokra" i ten stan jest zauważalny,
    // to włączamy podlewanie.
    moistureControlState.watering = dry > 0.1 && dry >= wet && dry >= optimal;

    // Jeśli roślina jest bardziej "mokra" niż "sucha" i ten stan jest zauważalny,
    // to włączamy odpompowywanie.
    moistureControlState.pumping = wet > 0.1 && wet > dry && wet >= optimal;
  } else if (moistureControlMode === "watering") {
    // Tryb ręczny: podlewanie
    moistureControlState.watering = true;
    moistureControlState.pumping = false;
  } else if (moistureControlMode === "pumping") {
    // Tryb ręczny: odpompowywanie
    moistureControlState.watering = false;
    moistureControlState.pumping = true;
  } else {
    // Brak aktywnego sterowania
    moistureControlState.watering = false;
    moistureControlState.pumping = false;
  }

  updateMoistureVisuals();
}

// Tryb SMART dla temperatury - smart ma priorytet
function syncTempControl() {
  const currentTemp = Number(temp);
  const currentSoil = Number(soil);

  // Lokalne ustawienia czułości
  const ventilationActivation = 0.02; // wentylacja reaguje już przy lekkim przegrzaniu
  const mistingHotActivation = 0.02; // zraszanie przy lekkim przegrzaniu
  const mistingDryActivation = 0.08; // zraszanie przy przesuszeniu
  const mistingColdActivation = 0.02; // opcjonalna reakcja przy chłodzie (obszar wspólny)

  const config = getPlantConfig();
  const tempOptimalCenter = config.temp.sets[1][1];
  const soilOptimalCenter = config.soil.sets[1][1];

  // Membershipy fuzzy
  const tempMap = getMembershipMap("temp", currentTemp);
  const soilMap = getMembershipMap("soil", currentSoil);

  const cold = tempMap["Zimno"] ?? 0;
  const hot = tempMap["Gorąco"] ?? 0;
  const dry = soilMap["Suche"] ?? 0;

  if (smartMode) {
    // Wentylacja działa, gdy robi się choć trochę za gorąco
    // i temperatura jest po prawej stronie optimum
    tempControlState.ventilation =
      hot > ventilationActivation && currentTemp > tempOptimalCenter;

    // Zraszanie działa szerzej:
    // - gdy gorąco,
    // - gdy sucho,
    // - oraz delikatnie przy chłodzie na obszarze wspólnym zbiorów,
    //   jeśli nadal jesteśmy po lewej stronie optimum
    tempControlState.misting =
      (hot > mistingHotActivation && currentTemp > tempOptimalCenter) ||
      (dry > mistingDryActivation && currentSoil < soilOptimalCenter) ||
      (cold > mistingColdActivation && currentTemp < tempOptimalCenter);
  } else if (tempControlMode.misting || tempControlMode.ventilation) {
    // Tryb ręczny
    tempControlState.misting = !!tempControlMode.misting;
    tempControlState.ventilation = !!tempControlMode.ventilation;
  } else {
    tempControlState.misting = false;
    tempControlState.ventilation = false;
  }

  updateTempVisuals();
}

// Sterowanie temperaturą i zraszaniem - smart ma priorytet
function applyTempControl() {
  let currentTemp = Number(temp);
  let currentSoil = Number(soil);

  // Lokalne ustawienia mocy
  const mistingWaterPower = 3.0; // ile wilgoci dodaje zraszanie
  const mistingCoolPower = 0.9; // jak bardzo zraszanie obniża temperaturę
  const ventilationCoolPower = 2.6; // jak mocno wentylacja chłodzi
  const ventilationDryLoss = 1.2; // ile wentylacja odbiera wilgoci

  const hotSoilLoss = 0.5; // dodatkowa utrata wilgoci przy przegrzaniu
  const coldSoilBoost = 0.8; // lekkie wsparcie wilgotności przy chłodzie

  if (smartMode) {
    // Membershipy fuzzy
    const tempMap = getMembershipMap("temp", currentTemp);
    const soilMap = getMembershipMap("soil", currentSoil);

    const optimalSoil = soilMap["Optymalne"] ?? 0;
    const wet = soilMap["Mokre"] ?? 0;

    const cold = tempMap["Zimno"] ?? 0;
    const hot = tempMap["Gorąco"] ?? 0;
    const dry = soilMap["Suche"] ?? 0;

    // DEFUZYFIKACJA
    const tempDecision = (cold * -1 + hot * 1) / (cold + hot || 1);
    const soilDecision =
      (dry * -1 + optimalSoil * 0 + wet * 1) / (dry + optimalSoil + wet || 1);

    // Zraszanie (wilgotność)
    currentSoil += Math.max(0, -soilDecision) * mistingWaterPower;

    // Chłodzenie (temperatura)
    currentTemp -= Math.max(0, tempDecision) * ventilationCoolPower;
    currentTemp -= Math.max(0, tempDecision) * mistingCoolPower;
    // // Zraszanie:
    // // - zwiększa wilgotność przy suchości,
    // // - może delikatnie działać także przy chłodzie,
    // // - i lekko schładza przy wysokiej temperaturze
    // currentSoil += Math.max(dry, cold) * mistingWaterPower;
    // currentTemp -= hot * mistingCoolPower;

    // // Wentylacja:
    // // - głównie chłodzi,
    // // - ale przy okazji osusza
    // currentTemp -= hot * ventilationCoolPower;
    // currentSoil -= hot * ventilationDryLoss;

    // // Dodatkowe dopracowanie bilansu wilgoci:
    // // - gdy bardzo gorąco, wilgoć szybciej ucieka
    // currentSoil -= hot * hotSoilLoss;

    // // - gdy chłodno, wilgoć może się trochę łatwiej utrzymywać
    // currentSoil += cold * coldSoilBoost;
  } else if (tempControlMode.misting || tempControlMode.ventilation) {
    // Tryb ręczny zostawiamy podobnie jak wcześniej
    if (tempControlMode.misting) {
      currentSoil = Math.min(100, currentSoil + mistingWaterPower);
      currentTemp = Math.max(-25, currentTemp - mistingCoolPower);
    }

    if (tempControlMode.ventilation) {
      currentTemp = Math.max(-25, currentTemp - ventilationCoolPower);
      currentSoil = Math.max(0, currentSoil - ventilationDryLoss);
    }
  }

  temp = String(Number(clamp(currentTemp, -25, 50).toFixed(1)));
  soil = String(Math.round(clamp(currentSoil, 0, 100)));

  syncTempControl();
  updateUI();
}

// Sterowanie zraszaniem - zmiana flagi, aplikacja w step()
function toggleMisting() {
  tempControlMode.misting = !tempControlMode.misting;
  syncTempControl(); // aktualizuj widok, nie aplikuj zmian od razu
}

// Sterowanie wentylacją - zmiana flagi, aplikacja w step()
function toggleVentilation() {
  tempControlMode.ventilation = !tempControlMode.ventilation;
  syncTempControl(); // aktualizuj widok, nie aplikuj zmian od razu
}

// Implementacja funkcji dla przycisków wentylatora i zraszacza
function windFan() {
  toggleVentilation();
}
function splatterFan() {
  toggleMisting();
}

// Eksport funkcji do globalnego scope dla przycisków HTML i innych modułów
function applyMoistureControl() {
  let currentSoil = Number(soil);

  if (smartMode) {
    // Membershipy fuzzy dla wilgotności gleby:
    // [Suche, Optymalne, Mokre]
    const [dry, optimal, wet] = getMemberships("soil", currentSoil);

    // Środek zbioru optymalnego
    const optimalCenter = getPlantConfig().soil.sets[1][1];

    // Ustalamy "bezpieczny" zakres wokół optimum.
    // Zamiast sztywnego sterowania progiem jako główną decyzją,
    // używamy fuzzy do decyzji, a ten zakres służy tylko jako cel końcowy.
    const targetMargin = 1.5;
    const lowTarget = optimalCenter - targetMargin;
    const highTarget = optimalCenter + targetMargin;

    // Jeśli dominuje "Suche", podlewamy tak długo,
    // aż dojdziemy do dolnej granicy zakresu optymalnego.
    if (dry > 0.1 && dry >= wet && dry >= optimal) {
      while (currentSoil < lowTarget) {
        currentSoil = Math.min(100, currentSoil + 1);
      }
    }

    // Jeśli dominuje "Mokre", odpompowujemy tak długo,
    // aż dojdziemy do górnej granicy zakresu optymalnego.
    if (wet > 0.1 && wet > dry && wet >= optimal) {
      while (currentSoil > highTarget) {
        currentSoil = Math.max(0, currentSoil - 1);
      }
    }

    soil = String(Math.round(currentSoil));
  } else if (moistureControlMode === "watering") {
    // Tryb ręczny: jedno mocniejsze podlanie
    currentSoil = Math.min(100, currentSoil + 4);
    soil = String(Math.round(currentSoil));
  } else if (moistureControlMode === "pumping") {
    // Tryb ręczny: jedno mocniejsze odpompowanie
    currentSoil = Math.max(0, currentSoil - 4);
    soil = String(Math.round(currentSoil));
  }

  syncMoistureControl();
  updateUI();
}

// Pobierz wartości rozmyte dla wilgotności gleby (podlewanie)
function waterFan() {
  moistureControlMode =
    moistureControlMode === "watering" ? "static" : "watering";
  applyMoistureControl();
}

// Pobierz wartości rozmyte dla wilgotności gleby (odpompowywanie)
function pumpingFan() {
  moistureControlMode =
    moistureControlMode === "pumping" ? "static" : "pumping";
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
  if (lampLightEl)
    lampLightEl.classList.toggle("visible", lampControlState.light);
  if (lampHeaterEl)
    lampHeaterEl.classList.toggle("visible", lampControlState.heat);
}

// Tryb SMART dla lampy - smart ma priorytet
function syncLampControl() {
  const currentLight = Number(light);
  const currentTemp = Number(temp);

  // Lokalne ustawienia czułości
  const darkActivation = 0.02; // lampka reaguje już przy lekkiej ciemności
  const coldActivation = 0.02; // grzałka reaguje już przy lekkim chłodzie

  const brightShutterThreshold = 0.35;
  const darkShutterThreshold = 0.02;
  const shutterFactor = 0.8;

  const config = getPlantConfig();
  const lightOptimalCenter = config.light.sets[1][1];
  const tempOptimalCenter = config.temp.sets[1][1];

  // Membershipy światła przed działaniem rolety
  const rawLightMap = getMembershipMap("light", currentLight);
  const rawDark = rawLightMap["Ciemne"] ?? 0;
  const rawBright = rawLightMap["Jasne"] ?? 0;

  if (smartMode) {
    let desiredShutter = shutterActive;

    // Roleta zasłania tylko wtedy, gdy faktycznie robi się jasno
    if (rawBright > brightShutterThreshold && rawBright > rawDark) {
      desiredShutter = true;
    }
    // Gdy tylko zaczyna być ciemno, odsłaniamy
    else if (rawDark > darkShutterThreshold && rawDark >= rawBright) {
      desiredShutter = false;
    }

    if (desiredShutter !== shutterActive) {
      shutterActive = desiredShutter;
      const shutterEl = document.querySelector(".shutter");
      if (shutterEl) {
        shutterEl.style.display = shutterActive ? "block" : "none";
      }
    }
  }

  // Roleta wpływa tylko na światło zastane / naturalne
  const effectiveLight = currentLight * (shutterActive ? shutterFactor : 1.0);

  const lightMap = getMembershipMap("light", effectiveLight);
  const tempMap = getMembershipMap("temp", currentTemp);

  const dark = lightMap["Ciemne"] ?? 0;
  const bright = lightMap["Jasne"] ?? 0;

  const cold = tempMap["Zimno"] ?? 0;
  const hot = tempMap["Gorąco"] ?? 0;

  if (smartMode) {
    // Lampka ma się włączać już wtedy, gdy jest choć trochę za ciemno
    // i jesteśmy po lewej stronie optimum
    lampControlState.light =
      dark > darkActivation && effectiveLight < lightOptimalCenter;

    // Grzałka ma się włączać już wtedy, gdy jest choć trochę za zimno
    // i temperatura jest po lewej stronie optimum
    lampControlState.heat =
      cold > coldActivation && currentTemp < tempOptimalCenter;
  } else if (lampControlMode.light || lampControlMode.heat) {
    lampControlState.light = !!lampControlMode.light;
    lampControlState.heat = !!lampControlMode.heat;
  } else {
    lampControlState.light = false;
    lampControlState.heat = false;
  }

  updateLampVisuals();
}

// Sterowanie światłem i ogrzewaniem
function applyLampControl() {
  let currentLight = Number(light);
  let currentTemp = Number(temp);

  // Ustawienia mocy
  const shutterFactor = 0.8; // roleta mniej tłumi światło
  const lightPower = 36; // mocniejsze doświetlanie
  const heatPower = 15; // mocniejsze grzanie
  const brightReduction = 1; // delikatniejsza redukcja przy nadmiarze światła
  const hotReduction = 0.2; // delikatniejsza redukcja temperatury

  // Najpierw wpływ rolety na światło zastane / naturalne
  let effectiveLight = currentLight * (shutterActive ? shutterFactor : 1.0);

  if (smartMode) {
    // Membershipy fuzzy po uwzględnieniu rolety
    const lightMap = getMembershipMap("light", effectiveLight);
    const tempMap = getMembershipMap("temp", currentTemp);

    const dark = lightMap["Ciemne"] ?? 0;
    const optimalLight = lightMap["Optymalne"] ?? 0;
    const bright = lightMap["Jasne"] ?? 0;

    const cold = tempMap["Zimno"] ?? 0;
    const hot = tempMap["Gorąco"] ?? 0;

    // DEFUZYFIKACJA

    // światło (-1 = ciemno, 0 = ok, 1 = jasno)
    const lightDecision =
      (dark * -1 + optimalLight * 0 + bright * 1) /
      (dark + optimalLight + bright || 1);

    // temperatura (-1 = zimno, 0 = ok, 1 = gorąco)
    const tempDecision = (cold * -1 + hot * 1) / (cold + hot || 1);

    // MOCY
    const lampPowerDynamic = Math.max(0, -lightDecision); // im ciemniej → więcej światła
    const dimPower = Math.max(0, lightDecision); // im jaśniej → redukcja

    const heatPowerDynamic = Math.max(0, -tempDecision); // zimno → grzej
    const coolReduction = Math.max(0, tempDecision); // gorąco → ogranicz

    // DZIAŁANIE

    // lampa
    effectiveLight += lampPowerDynamic * lightPower;
    effectiveLight -= dimPower * brightReduction;

    // grzałka
    currentTemp += heatPowerDynamic * heatPower;

    // ograniczenie temperatury (np. pasywne chłodzenie)
    currentTemp -= coolReduction * hotReduction;

    // // Im bardziej ciemno, tym mocniej świeci lampka
    // effectiveLight += dark * lightPower;

    // // Gdy naprawdę jasno, tylko lekko zmniejszamy bilans światła
    // effectiveLight -= bright * brightReduction;

    // // Im bardziej zimno, tym mocniej działa grzałka
    // currentTemp += cold * heatPower;

    // // Gdy gorąco, lekko ograniczamy temperaturę
    // currentTemp -= hot * hotReduction;
    // Tryb manualny
  } else if (lampControlMode.light || lampControlMode.heat) {
    if (lampControlMode.light) {
      effectiveLight = Math.min(100, effectiveLight + lightPower);
    }

    if (lampControlMode.heat) {
      currentTemp = Math.min(50, currentTemp + heatPower);
    }
  }

  light = String(Math.round(clamp(effectiveLight, 0, 100)));
  temp = String(Number(clamp(currentTemp, -25, 50).toFixed(1)));

  syncLampControl();
}

// Implementacja funkcji dla przycisków wentylatora i zraszacza
function lampLight() {
  toggleLight();
}
function lampHeater() {
  toggleHeater();
}

// Sterowanie światłem - zmiana flagi, aplikacja w step()
function toggleLight() {
  lampControlMode.light = !lampControlMode.light;
  syncLampControl(); // aktualizuj widok, nie aplikuj zmian od razu
}

// Sterowanie grzaniem - zmiana flagi, aplikacja w step()
function toggleHeater() {
  lampControlMode.heat = !lampControlMode.heat;
  syncLampControl(); // aktualizuj widok, nie aplikuj zmian od razu
}

// ROLETA //
function toggleShutter() {
  const shutter = document.querySelector(".shutter");
  shutterActive = !shutterActive;
  shutter.style.display = shutterActive ? "block" : "none";
  syncLampControl(); // aktualizuj sterowanie lampą
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
