//Plik time.js odpowiedzialny jest za przejście do następnej tury oraz zarządzanie:
// mocą światła, porą dnia, temperaturą, wilgotnością, aktualną porą roku, komunikatami stanu rośliny.

// Sterowanie mocą światła dla danej pory roku
function getSeasonLightPercent(seasonName, hour) {
  const schedule =
    seasonLightSchedule[seasonName] || seasonLightSchedule.spring;
  const entry = schedule.find((item) => hour >= item.from && hour <= item.to);
  return entry ? entry.value : 0;
}

// Sterowanie mocą światła dla custom pory roku
function getCustomLightPercent(hour) {
  const minLight = Math.min(
    customSeasonConfig.lightMin,
    customSeasonConfig.lightMax,
  );
  const maxLight = Math.max(
    customSeasonConfig.lightMin,
    customSeasonConfig.lightMax,
  );

  // Sterowanie mocy światła ze wzgledu na godzinę
  if (hour >= 0 && hour <= 4) return 0;
  if (hour >= 5 && hour <= 7) return minLight * 0.6;
  if (hour >= 8 && hour <= 11) return (minLight + maxLight) / 2;
  if (hour >= 12 && hour <= 14) return maxLight;
  if (hour >= 15 && hour <= 19) return (minLight + maxLight) / 2;
  return 0;
}

// Losowanie temperatury dla danej pory roku
function randomSeasonTemperature(seasonName) {
  const range = seasonTempRanges[seasonName] || seasonTempRanges.spring;
  return range.min + Math.random() * (range.max - range.min);
}

// Losowanie temperatury dla custom pory roku
function randomCustomTemperature() {
  const minTemp = Math.min(
    customSeasonConfig.tempMin,
    customSeasonConfig.tempMax,
  );
  const maxTemp = Math.max(
    customSeasonConfig.tempMin,
    customSeasonConfig.tempMax,
  );
  return minTemp + Math.random() * (maxTemp - minTemp);
}

// ZMIANA
function applyNaturalEnvironment() {
  const plantRates = plantRateConfig[plant] || plantRateConfig.storczyk;
  const dayFactor = triangle(time, 6, 12, 18);

  let currentLight = Number(light);
  let currentTemp = Number(temp);
  let currentSoil = Number(soil);

  // Światło zależy od aktualnej pory roku:
  // - jeśli aktywna jest custom pora roku, używany jest zakres użytkownika
  // - w przeciwnym wypadku wybrany zostaje standardowy harmonogram
  const scheduledLight = customSeasonActive
    ? getCustomLightPercent(time)
    : getSeasonLightPercent(season, time);

  // Dodajemy mały losowy szum, aby środowisko nie było całkowicie sztywne
  currentLight = clamp(scheduledLight + (Math.random() * 10 - 5), 0, 100);

  // Temperatura dąży do docelowego zakresu temperatury pory roku / własnej pory roku
  const targetTemp = customSeasonActive
    ? randomCustomTemperature()
    : randomSeasonTemperature(season);

  // Stopień adaptacji zależy od typu rośliny
  currentTemp += (targetTemp - currentTemp) * plantRates.tempAdaptation;
  currentTemp = Number(currentTemp.toFixed(1));

  // Ubytek wilgotności gleby:
  // - zależy od poru roku lub custom pory roku,
  // - jest większy w dzień,
  // - rośnie przy wyższej temperaturze,
  // - oraz jest skalowany parametrem rośliny
  const baseDrain = customSeasonActive
    ? customSeasonConfig.soilDrain
    : seasonSoilDrain[season];

  const soilDrain =
    baseDrain * plantRates.soilDrain +
    dayFactor * 0.2 +
    (currentTemp > 24 ? 0.25 : 0);

  currentSoil = clamp(currentSoil - soilDrain, 0, 100);

  light = String(Math.round(currentLight));
  temp = String(currentTemp);
  soil = String(Math.round(currentSoil));
}

// Automatyczna zmiana pory roku co `days.value` dni
function nextSeason() {
  // nie zmienia pory roku dla gry własnej
  if (customSeasonActive) return;

  const currentIndex = seasons.indexOf(season);
  if (currentIndex !== -1) {
    const nextIndex = (currentIndex + 1) % seasons.length;
    season = seasons[nextIndex];
    seasonDay = 0;

    const seasonName = season === "winter" ? "zima" : season === "spring" ? "wiosna" : season === "summer" ? "lato" : season === "autumn" ? "jesień" : season;

    msgSeason.innerText = "Nastała pora roku: " + seasonName;
    msgSeason.style.background = "var(--primary-color)";
  }
}

//
function step(timeStep) {
  for (let i = 0; i < timeStep; i++) {
    // Najpierw działa środowisko naturalne
    applyNaturalEnvironment();

    // Potem działają urządzenia
    applyMoistureControl();
    applyTempControl();
    if (typeof applyLampControl === "function") applyLampControl();

    // Aktualne wartości
    const s = Number(soil);
    const l = Number(light);
    const t = Number(temp);

    // FUZZIFICATION
    // Membershipy pobieramy przez helper z script.js
    const [soilDry, soilOptimal, soilWet] = getMemberships("soil", s);
    const [tempCold, tempOptimal, tempHot] = getMemberships("temp", t);
    const [lightDark, lightOptimal, lightBright] = getMemberships("light", l);

    // Rozmyty podział na dzień i noc
    const day = triangle(time, 6, 12, 18);
    const night = 1 - day;

    // REGUŁY STRESU
    const ruleSoilDry = soilDry;
    const ruleSoilWet = soilWet;
    const ruleTempCold = tempCold;
    const ruleTempHot = tempHot;
    const ruleDarkInDay = Math.min(lightDark, day);
    const ruleBrightAtNight = Math.min(lightBright, night);

    const bad = Math.max(
      ruleSoilDry,
      ruleSoilWet,
      ruleTempCold,
      ruleTempHot,
      ruleDarkInDay,
      ruleBrightAtNight,
    );

    // REGUŁY DOBROSTANU

    // Dobre warunki w dzień:
    // - gleba optymalna
    // - temperatura optymalna
    // - światło optymalne
    const goodDay = Math.min(soilOptimal, tempOptimal, lightOptimal, day);

    // Dobre warunki w nocy:
    // - gleba optymalna
    // - temperatura optymalna
    const goodNight = Math.min(soilOptimal, tempOptimal, night);

    const good = Math.max(goodDay, goodNight);

    // DECYZJA / UPROSZCZONA DEFUZYFIKACJA

    // Złe warunki obniżają zdrowie mocniej,
    // dobre warunki poprawiają zdrowie słabiej, ale regularnie
    const change = good * 4.5 - bad * 8 + 0.4;

    health = Number(clamp(health + change, 0, 100).toFixed(1));

    // KOMUNIKAT STANU

    const balance = good - bad;

    if (balance < -0.35) {
      msgState.innerText = "Warunki złe!";
      msgState.style.background = "#d9534f";
    } else if (balance < 0.05) {
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

      // Przy custom season nie przechodzimy automatycznie dalej
      if (!customSeasonActive && seasonDay >= seasonLength) {
        nextSeason();
      }
    }

    totalDay = clamp(totalDay, 0, 999);
    updateHistory();
  }

  updateUI();

  if (health <= 0) {
    alert("Roślina zwiędła");
  }
}

window.nextSeason = nextSeason;
window.step = step;
