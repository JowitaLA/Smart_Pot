// Parametry w doniczce
function applyNaturalEnvironment() {
  const plantRates = plantRateConfig[plant] || plantRateConfig.storczyk;
  const dayFactor = triangle(time, 6, 12, 18);
  const seasonLightFactor =
    season === "summer"
      ? 0.9
      : season === "spring" || season === "autumn"
      ? 0.75
      : 0.45;

  let currentLight = Number(light);
  let currentTemp = Number(temp);
  let currentSoil = Number(soil);

  const lightChange = dayFactor * seasonLightFactor * plantRates.lightGain * 2 -
    (1 - dayFactor) * 1.4;
  currentLight = Math.max(0, Math.min(100, currentLight + lightChange));

  const ambientBase = plantRates.seasonalBases[season] ?? 12;
  const ambientAmp = plantRates.seasonalAmplitudes[season] ?? 8;
  const ambient = ambientBase + ambientAmp * dayFactor;
  currentTemp += (ambient - currentTemp) * plantRates.tempAdaptation;
  currentTemp = Number(currentTemp.toFixed(1));

  const soilDrain =
    plantRates.soilDrain + dayFactor * 0.5 + (currentTemp > 24 ? 0.35 : 0);
  currentSoil = Math.max(0, Math.min(100, currentSoil - soilDrain));

  light = String(Math.round(currentLight));
  temp = String(currentTemp);
  soil = String(Math.round(currentSoil));
}

function step(timeStep) {
  for (let i = 0; i < timeStep; i++) {
    applyNaturalEnvironment();
    applyMoistureControl();
    applyTempControl();
    if (typeof applyLampControl === 'function') applyLampControl();

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
      if (seasonDay > seasonLength) {
        nextSeason();
      }
    }
    totalDay = Math.max(0, totalDay);
    totalDay = Math.min(totalDay, 999);
    updateHistory();
    updateUI();
  }
  if (health <= 0) {
    alert("Roślina zwiędła");
  }

  if (health == 100) {
    //alert("Roślina jest w idealnym stanie");
  }
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

window.nextSeason = nextSeason;
window.step = step;
