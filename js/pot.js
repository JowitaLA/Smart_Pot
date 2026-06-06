// STEROWANIE STANEM DONICZKI NA PODSTAWIE ZDROWIA ROŚLINY
function updatePotStatus() {
  const potStatus = document.getElementById("potStatus");
  
  if (health > 66) {
    potStatus.src = "img/pot/pot/happy.png";
  } else if (health > 33) {
    potStatus.src = "img/pot/pot/sad.png";
  } else {
    potStatus.src = "img/pot/pot/dead.png";
  }
}

// NOTYFIKACJE NA PODSTAWIE FUZZY LOGIKI
function updatePotNotifications() {
  // Pobranie konfiguracji fuzzy dla aktualnej rośliny
  const config = plantFuzzyConfig[plant];
  
  // Obliczenie stopnia przynależności dla każdego parametru
  const soilMembership = calculateMembership(soil, config.soil.sets);
  const lightMembership = calculateMembership(light, config.light.sets);
  const tempMembership = calculateMembership(temp, config.temp.sets);
  
  // TEMPERATURA
  const potCold = document.getElementById("potCold");
  const potHot = document.getElementById("potHot");
  const optimalTempCenter = config.temp.sets[1][1];
  const optimalLightCenter = config.light.sets[1][1];
  const optimalSoilCenter = config.soil.sets[1][1];
  const optimalMargin = 3; // margines od środka

  // Zimno / Gorąco: mierzymy od idealnego środka temperatury
  potCold.style.display = Number(temp) < optimalTempCenter - optimalMargin ? "block" : "none";
  potHot.style.display = Number(temp) > optimalTempCenter + optimalMargin ? "block" : "none";
  
  // WILGOTNOŚĆ GLEBY: mierzymy od idealnego środka wilgotności
  const potMist = document.getElementById("potMist");
  const potWater = document.getElementById("potWater");
  potMist.style.display = Number(soil) < optimalSoilCenter - optimalMargin ? "block" : "none";
  potWater.style.display = Number(soil) > optimalSoilCenter + optimalMargin ? "block" : "none";
  
  // ŚWIATŁO: mierzymy od idealnego środka światła
  const potShade = document.getElementById("potShade");
  const potSun = document.getElementById("potSun");
  potShade.style.display = Number(light) < optimalLightCenter - optimalMargin ? "block" : "none";
  potSun.style.display = Number(light) > optimalLightCenter + optimalMargin ? "block" : "none";
}

// POMOCNICZA FUNKCJA DO OBLICZENIA STOPNIA PRZYNALEŻNOŚCI
function calculateMembership(value, sets) {
  return sets.map(set => triangle(value, set[0], set[1], set[2]));
}
