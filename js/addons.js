// Plik addons.js odpowiada za akcje poza symulatorem. Obejmuje on:
// aktualizację roku w stopce, sterowania muzyką, zmiany zakresów dla rośliny i jej wybór, 
// zmianę pory roku i czas jej trwania, ustawienie parametrów dla gry custom.

// Ustawienie aktualnego roku w stopce
const year = new Date().getFullYear();
document.getElementById("year").textContent = year;

// Start/stop muzyki
const music = document.getElementById("bgMusic");
const btn = document.getElementById("musicToggle");
const icon = document.getElementById("iconPath");

let isPlaying = true;

// reakcja na start/stop
btn.addEventListener("click", () => {
  if (isPlaying) {
    music.pause();
    // Start
    icon.setAttribute(
      "d",
      "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z",
    );
  } else {
    music.play();

    // Stop
    icon.setAttribute(
      "d",
      "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5",
    );
  }

  isPlaying = !isPlaying;
});

// autoplay po pierwszym kliknięciu gdziekolwiek
document.addEventListener(
  "click",
  () => {
    music.play();
    music.volume = 0.2;
  },
  { once: true },
);

// modal aktywny na początku
window.addEventListener('load', function () {
    const myModal = new bootstrap.Modal(document.getElementById('helpModal'));
    myModal.show();
  });


// PRZYCISKI PONIŻEJ SYMULACJI - aktualizowanie etykiet pod suwakami
if (soilNewPlant) {
  soilNewPlant.addEventListener("input", () => {
    const el = document.getElementById("soilNewPlantVal");
    if (el) el.innerText = soilNewPlant.value;
  });
}
if (lightNewPlant) {
  lightNewPlant.addEventListener("input", () => {
    const el = document.getElementById("lightNewPlantVal");
    if (el) el.innerText = lightNewPlant.value;
  });
}
if (tempNewPlant) {
  tempNewPlant.addEventListener("input", () => {
    const el = document.getElementById("tempNewPlantVal");
    if (el) el.innerText = tempNewPlant.value;
  });
}
if (healthNewPlant) {
  healthNewPlant.addEventListener("input", () => {
    const el = document.getElementById("healthNewPlantVal");
    if (el) el.innerText = healthNewPlant.value;
  });
}

// suwak dni
days.addEventListener("input", () => {
  const el = document.getElementById("dayVal");
  if (el) el.innerText = days.value;
});

// Zmiana rośliny
function changePlant(newPlant) {
  plant = newPlant;

  health = parseInt(healthNewPlant.value, 10); // zdrowie rośliny
  soil = parseInt(soilNewPlant.value, 10); // wilgotność gleby
  light = parseInt(lightNewPlant.value, 10); // światło
  temp = parseInt(tempNewPlant.value, 10); // temperatura

  msgInfo.innerText = "Zmieniłeś roślinę na " + plant;
  msgInfo.style.background = "var(--primary-color)";

  resetHistory();
  updateUI();
}

// Zmiana pory roku
function changeSeason(newSeason) {
  customSeasonActive = false;
  season = newSeason;
  changePlant(plant); // reset rośliny do domyślnej przy zmianie pory roku
  const seasonName = season === "winter" ? "zimę" : season === "spring" ? "wiosnę" : season === "summer" ? "lato" : season === "autumn" ? "jesień" : season;

  time = 8; // czas
  totalDay = 0; // dzień
  seasonDay = 0; // reset liczby dni w sezonie
  msgSeason.innerText =
    "Zmieniono porę roku na " +
    seasonName +
    ".\nKażda pora roku będzie wynosić " +
    days.value +
    " dni.";
  msgSeason.style.background = "var(--primary-color)";

  resetHistory();
  updateUI();
}

function changeCustom() {
  customSeasonActive = true;
  season = "custom";
  time = 8;
  totalDay = 0;
  seasonDay = 0;

  customSeasonConfig.tempMin = parseInt(customTempMin.value, 10);
  customSeasonConfig.tempMax = parseInt(customTempMax.value, 10);
  customSeasonConfig.lightMin = parseInt(customLightMin.value, 10);
  customSeasonConfig.lightMax = parseInt(customLightMax.value, 10);
  customSeasonConfig.soilDrain = parseFloat(customSoilDrain.value);

  const minTemp = Math.min(
    customSeasonConfig.tempMin,
    customSeasonConfig.tempMax,
  );
  const maxTemp = Math.max(
    customSeasonConfig.tempMin,
    customSeasonConfig.tempMax,
  );
  const minLight = Math.min(
    customSeasonConfig.lightMin,
    customSeasonConfig.lightMax,
  );
  const maxLight = Math.max(
    customSeasonConfig.lightMin,
    customSeasonConfig.lightMax,
  );

  temp = (minTemp + Math.random() * (maxTemp - minTemp)).toFixed(1);
  light = String(Math.round(minLight + Math.random() * (maxLight - minLight)));
  soil = String(Math.round(20 + Math.random() * 60));

  msgSeason.innerText = "Tryb własny uruchomiony. Własna pora roku aktywna.";
  msgSeason.style.background = "var(--primary-color)";

  resetHistory();
  updateUI();
}

// ZAKRESY DLA GRY CUSTOM
// Pobierz elementy input i label dla temperatury
const customTempMin = document.getElementById("customTempMin");
const customTempMax = document.getElementById("customTempMax");
const tempRangeMin = document.getElementById("tempRangeMin");
const tempRangeMax = document.getElementById("tempRangeMax");

if (customTempMin && customTempMax && tempRangeMin) {
  customTempMin.addEventListener("input", () => {
    if (parseInt(customTempMin.value) > parseInt(customTempMax.value)) {
      customTempMin.value = customTempMax.value;
    }
    tempRangeMin.textContent = customTempMin.value;
  });
}

if (customTempMin && customTempMax && tempRangeMax) {
  customTempMax.addEventListener("input", () => {
    if (parseInt(customTempMax.value) < parseInt(customTempMin.value)) {
      customTempMax.value = customTempMin.value;
    }
    tempRangeMax.textContent = customTempMax.value;
  });
}

// Pobierz elementy input i label dla pobierania wody
const customSoilDrain = document.getElementById("customSoilDrain");
const soilDrainVal = document.getElementById("soilDrainVal");

if (customSoilDrain && soilDrainVal) {
  customSoilDrain.addEventListener("input", () => {
    soilDrainVal.textContent = Number(customSoilDrain.value).toFixed(2);
  });
}

// Pobierz elementy input i label dla światła
const customLightMin = document.getElementById("customLightMin");
const customLightMax = document.getElementById("customLightMax");
const lightRangeMin = document.getElementById("lightRangeMin");
const lightRangeMax = document.getElementById("lightRangeMax");

if (customLightMin && customLightMax && lightRangeMin) {
  customLightMin.addEventListener("input", () => {
    if (parseInt(customLightMin.value) > parseInt(customLightMax.value)) {
      customLightMin.value = customLightMax.value;
    }
    lightRangeMin.textContent = customLightMin.value;
  });
}

if (customLightMin && customLightMax && lightRangeMax) {
  customLightMax.addEventListener("input", () => {
    if (parseInt(customLightMax.value) < parseInt(customLightMin.value)) {
      customLightMax.value = customLightMin.value;
    }
    lightRangeMax.textContent = customLightMax.value;
  });
}

window.changePlant = changePlant;
window.changeSeason = changeSeason;
window.changeCustom = changeCustom;
