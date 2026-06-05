// Plik z funkcją zmiany zakresów dla gry custom oraz aktualizacją roku w stopce.

// Ustaw aktualny rok w stopce
const year = new Date().getFullYear();
document.getElementById("year").textContent = year;

// PRZYCISKI PONIŻEJ SYMULACJI --- tylko aktualizuj etykiety pod suwakami
soilNewPlant.addEventListener("input", () => {
  const el = document.getElementById("soilNewPlantVal");
  if (el) el.innerText = soilNewPlant.value;
});
lightNewPlant.addEventListener("input", () => {
  const el = document.getElementById("lightNewPlantVal");
  if (el) el.innerText = lightNewPlant.value;
});
tempNewPlant.addEventListener("input", () => {
  const el = document.getElementById("tempNewPlantVal");
  if (el) el.innerText = tempNewPlant.value;
});
healthNewPlant.addEventListener("input", () => {
  const el = document.getElementById("healthNewPlantVal");
  if (el) el.innerText = healthNewPlant.value;
});

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
  season = newSeason;
  changePlant(plant); // reset rośliny do domyślnej przy zmianie pory roku

  time = 8; // czas
  totalDay = 0; // dzień
  seasonDay = 0; // reset liczby dni w sezonie
  msgSeason.innerText =
    "Zmieniono porę roku na " +
    season +
    ".\nKażda pora roku będzie wynosić " +
    days.value +
    " dni.";
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
customTempMin.addEventListener("input", () => {
  if (parseInt(customTempMin.value) > parseInt(customTempMax.value)) {
    customTempMin.value = customTempMax.value;
  }
  tempRangeMin.textContent = customTempMin.value;
});
customTempMax.addEventListener("input", () => {
  if (parseInt(customTempMax.value) < parseInt(customTempMin.value)) {
    customTempMax.value = customTempMin.value;
  }
  tempRangeMax.textContent = customTempMax.value;
});

// Pobierz elementy input i label dla wilgotności
const customSoilMin = document.getElementById("customSoilMin");
const customSoilMax = document.getElementById("customSoilMax");
const soilRangeMin = document.getElementById("soilRangeMin");
const soilRangeMax = document.getElementById("soilRangeMax");
customSoilMin.addEventListener("input", () => {
  if (parseInt(customSoilMin.value) > parseInt(customSoilMax.value)) {
    customSoilMin.value = customSoilMax.value;
  }
  soilRangeMin.textContent = customSoilMin.value;
});
customSoilMax.addEventListener("input", () => {
  if (parseInt(customSoilMax.value) < parseInt(customSoilMin.value)) {
    customSoilMax.value = customSoilMin.value;
  }
  soilRangeMax.textContent = customSoilMax.value;
});

// Pobierz elementy input i label dla światła
const customLightMin = document.getElementById("customLightMin");
const customLightMax = document.getElementById("customLightMax");
const lightRangeMin = document.getElementById("lightRangeMin");
const lightRangeMax = document.getElementById("lightRangeMax");
customLightMin.addEventListener("input", () => {
  if (parseInt(customLightMin.value) > parseInt(customLightMax.value)) {
    customLightMin.value = customLightMax.value;
  }
  lightRangeMin.textContent = customLightMin.value;
});
customLightMax.addEventListener("input", () => {
  if (parseInt(customLightMax.value) < parseInt(customLightMin.value)) {
    customLightMax.value = customLightMin.value;
  }
  lightRangeMax.textContent = customLightMax.value;
});


window.changePlant = changePlant;
window.changeSeason = changeSeason;