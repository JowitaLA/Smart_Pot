// Plik update.js ma za zadanie aktualizować interferjs użytkownika.

// Aktualizacja interfejsu użytkownika
function updateUI() {
  document.getElementById("time").innerText = time;
  document.getElementById("day").innerText = totalDay;
  document.getElementById("dayVal").innerText = days.value;

  document.getElementById("soilVal").innerText = soil;
  document.getElementById("lightVal").innerText = light;
  document.getElementById("tempVal").innerText = temp;
  document.getElementById("actuallytemp").innerText = temp;
  document.getElementById("healthVal").innerText = health;

  const seasonIcon = customSeasonActive ? "custom" : season;
  document.getElementById("clockSeason").src = "img/clock/" + seasonIcon + ".png";

  document.getElementById("soilNewPlantVal").innerText = soilNewPlant.value;
  document.getElementById("lightNewPlantVal").innerText = lightNewPlant.value;
  document.getElementById("tempNewPlantVal").innerText = tempNewPlant.value;
  document.getElementById("healthNewPlantVal").innerText = healthNewPlant.value;

  document.getElementById("plant").src =
    "img/pot/flowers/" +
    (plant == "storczyk" ? "orchid" : plant == "kaktus" ? "cactus" : "fern") +
    "_" +
    (health > 50 ? "good" : health > 30 ? "ok" : "bad") +
    ".png";

  const smartIcon = document.getElementById("potSmartOn");
  if (smartIcon) {
    smartIcon.style.display = smartMode ? "block" : "none";
  }

  syncMoistureControl();
  syncTempControl();
  if (typeof syncLampControl === 'function') syncLampControl();

  // Aktualizacja statusu doniczki i notyfikacji
  updatePotStatus();
  updatePotNotifications();

  // Dzień / noc
  let day = triangle(time, 6, 12, 18);
  sky.style.background = day > 0.6 ? "#79b3c7" : day > 0.2 ? "#bc9243" : "#33353e";

  drawFuzzyChart();

  msgState.style.padding = "10px";
  msgInfo.style.padding = "10px";
  msgSeason.style.padding = "10px";

  let currentMsg = msgState.innerText;
  setTimeout(() => {
    if (msgState.innerText === currentMsg) {
      msgState.innerText = "";
      msgState.style.padding = "0px";
    }
  }, 3000);

  currentMsg = msgSeason.innerText;
  setTimeout(() => {
    if (msgSeason.innerText === currentMsg) {
      msgSeason.innerText = "";
      msgSeason.style.padding = "0px";
    }
  }, 3000);

  currentMsg = msgInfo.innerText;
  setTimeout(() => {
    if (msgInfo.innerText === currentMsg) {
      msgInfo.innerText = "";
      msgInfo.style.padding = "0px";
    }
  }, 3000);
}