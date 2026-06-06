// Parametry w doniczce
function getCustomLightPercent(hour) {
  const minLight = Math.min(customSeasonConfig.lightMin, customSeasonConfig.lightMax);
  const maxLight = Math.max(customSeasonConfig.lightMin, customSeasonConfig.lightMax);

  if (hour >= 0 && hour <= 4) return 0;
  if (hour >= 5 && hour <= 7) return minLight * 0.6;
  if (hour >= 8 && hour <= 11) return (minLight + maxLight) / 2;
  if (hour >= 12 && hour <= 14) return maxLight;
  if (hour >= 15 && hour <= 19) return (minLight + maxLight) / 2;
  return 0;
}

function getSeasonLightPercent(seasonName, hour) {
  const schedule = seasonLightSchedule[seasonName] || seasonLightSchedule.spring;
  const entry = schedule.find((item) => hour >= item.from && hour <= item.to);
  return entry ? entry.value : 0;
}

function randomCustomTemperature() {
  const minTemp = Math.min(customSeasonConfig.tempMin, customSeasonConfig.tempMax);
  const maxTemp = Math.max(customSeasonConfig.tempMin, customSeasonConfig.tempMax);
  return minTemp + Math.random() * (maxTemp - minTemp);
}

function randomSeasonTemperature(seasonName) {
  const range = seasonTempRanges[seasonName] || seasonTempRanges.spring;
  return range.min + Math.random() * (range.max - range.min);
}

function applyNaturalEnvironment() {
  const plantRates = plantRateConfig[plant] || plantRateConfig.storczyk;
  const dayFactor = triangle(time, 6, 12, 18);

  let currentLight = Number(light);
  let currentTemp = Number(temp);
  let currentSoil = Number(soil);

  const scheduledLight = customSeasonActive
    ? getCustomLightPercent(time)
    : getSeasonLightPercent(season, time);
  currentLight = Math.max(
    0,
    Math.min(100, scheduledLight + (Math.random() * 10 - 5)),
  );

  const targetTemp = customSeasonActive
    ? randomCustomTemperature()
    : randomSeasonTemperature(season);
  currentTemp += (targetTemp - currentTemp) * plantRates.tempAdaptation;
  currentTemp = Number(currentTemp.toFixed(1));

  const soilDrain =
    (customSeasonActive ? customSeasonConfig.soilDrain : seasonSoilDrain[season]) +
    dayFactor * 0.1 +
    (currentTemp > 24 ? 0.2 : 0);
  currentSoil = Math.max(0, Math.min(100, currentSoil - soilDrain));

  light = String(Math.round(currentLight));
  temp = String(currentTemp);
  soil = String(Math.round(currentSoil));
}

// Automatyczna zmiana pory roku co days.value dni
function nextSeason() {
  if (customSeasonActive) return;
  const currentIndex = seasons.indexOf(season);
  if (currentIndex !== -1) {
    const nextIndex = (currentIndex + 1) % seasons.length;
    season = seasons[nextIndex];
    seasonDay = 0;
    msg.innerText = "Nastała pora roku: " + season;
    msgInfo.style.background = "var(--primary-color)";
  }
}

function step(timeStep) {
  for (let i = 0; i < timeStep; i++) {
    applyNaturalEnvironment();
    applyMoistureControl();
    applyTempControl();
    if (typeof applyLampControl === 'function') applyLampControl();

    let s = soil;   // wilgotność gleby
    let l = light;  // światło
    let t = temp;   // temperatura

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

        updateUI();

      const seasonLength = parseInt(days.value, 10) || 10;
      if (!customSeasonActive && seasonDay >= seasonLength) {
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

window.nextSeason = nextSeason;
window.step = step;
