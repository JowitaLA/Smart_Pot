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
  
  // Zimno = pierwszy zbiór (index 0)
  potCold.style.display = tempMembership[0] > 0.3 ? "block" : "none";
  // Gorąco = trzeci zbiór (index 2)
  potHot.style.display = tempMembership[2] > 0.3 ? "block" : "none";
  
  // WILGOTNOŚĆ GLEBY
  const potMist = document.getElementById("potMist");
  const potWater = document.getElementById("potWater");
  
  // Za mało wody (Suche) = pierwszy zbiór (index 0)
  potMist.style.display = soilMembership[0] > 0.3 ? "block" : "none";
  // Za dużo wody (Mokre) = trzeci zbiór (index 2)
  potWater.style.display = soilMembership[2] > 0.3 ? "block" : "none";
  
  // ŚWIATŁO
  const potShade = document.getElementById("potShade");
  const potSun = document.getElementById("potSun");
  
  // Za ciemno (Ciemne) = pierwszy zbiór (index 0)
  potShade.style.display = lightMembership[0] > 0.3 ? "block" : "none";
  // Za jasno (Jasne) = trzeci zbiór (index 2)
  potSun.style.display = lightMembership[2] > 0.3 ? "block" : "none";
}

// POMOCNICZA FUNKCJA DO OBLICZENIA STOPNIA PRZYNALEŻNOŚCI
function calculateMembership(value, sets) {
  return sets.map(set => triangle(value, set[0], set[1], set[2]));
}
