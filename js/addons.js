// Ustaw aktualny rok w stopce
const year = new Date().getFullYear();
document.getElementById("year").textContent = year;

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