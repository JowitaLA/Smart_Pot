// Plik pot.js odpowiedzialny jest za wyświetlanie stanu rośliny oraz jej powiadomień.

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

// INFORMACJE DONICZKI
function updatePotNotifications() {
  // Ostrzeżenie ma się pojawić już wtedy,
  // gdy przynależność do złego zbioru jest większa od zera
  const EPS = 0.01;

  // Pobranie mapy przynależności fuzzy dla aktualnych wartości.
  // np. { Zimno: 0.1, Optymalne: 0.05, Gorąco: 0 }
  const soilMap = getMembershipMap("soil", soil);
  const lightMap = getMembershipMap("light", light);
  const tempMap = getMembershipMap("temp", temp);

  // Pobranie aktualnej konfiguracji zbiorów dla wybranej rośliny.
  const config = getPlantConfig();

  // Środki zbiorów "Optymalne" dla każdej zmiennej.
  // Potrzebujemy ich po to, aby wiedzieć, po której stronie optimum znajduje się wartość:
  // - jeśli jesteśmy po lewej stronie optimum -> możliwe "za mało"
  // - jeśli jesteśmy po prawej stronie optimum -> możliwe "za dużo"
  const soilOptimalCenter = config.soil.sets[1][1];
  const lightOptimalCenter = config.light.sets[1][1];
  const tempOptimalCenter = config.temp.sets[1][1];

  // TEMPERATURA
  // Pobieramy elementy HTML odpowiedzialne za ikonki temperatury.
  const potCold = document.getElementById("potCold");
  const potHot = document.getElementById("potHot");

  // "Za zimno" pokazujemy wtedy, gdy:
  // 1) istnieje choć minimalna przynależność do zbioru "Zimno"
  // 2) aktualna temperatura jest po lewej stronie optimum
  const isCold = (tempMap["Zimno"] ?? 0) > EPS && Number(temp) < tempOptimalCenter;

  // "Za gorąco" działa analogicznie:
  // 1) istnieje przynależność do zbioru "Gorąco"
  // 2) temperatura jest po prawej stronie optimum
  const isHot = (tempMap["Gorąco"] ?? 0) > EPS && Number(temp) > tempOptimalCenter;

  // Wyświetlanie/chowanie ikon
  if (potCold) {
    potCold.style.display = isCold ? "block" : "none";
  }

  if (potHot) {
    potHot.style.display = isHot ? "block" : "none";
  }

  // WILGOTNOŚĆ GLEBY
  // Pobieramy ikonki dotyczące gleby.
  const potMist = document.getElementById("potMist");
  const potWater = document.getElementById("potWater");

  // "Za sucho":
  // - istnieje przynależność do zbioru "Suche"
  // - wilgotność jest niższa niż optimum
  const isDry = (soilMap["Suche"] ?? 0) > EPS && Number(soil) < soilOptimalCenter;

  // "Za mokro":
  // - istnieje przynależność do zbioru "Mokre"
  // - wilgotność jest wyższa niż optimum
  const isWet = (soilMap["Mokre"] ?? 0) > EPS && Number(soil) > soilOptimalCenter;

  // Wyświetlanie/chowanie ikon
  if (potMist) {
    potMist.style.display = isDry ? "block" : "none";
  }

  if (potWater) {
    potWater.style.display = isWet ? "block" : "none";
  }

  // ŚWIATŁO
  // Pobieramy ikonki dotyczące światła.
  const potShade = document.getElementById("potShade");
  const potSun = document.getElementById("potSun");

  // "Za ciemno":
  // - istnieje przynależność do zbioru "Ciemne"
  // - poziom światła jest niższy niż optimum
  const isDark = (lightMap["Ciemne"] ?? 0) > EPS && Number(light) < lightOptimalCenter;

  // "Za jasno":
  // - istnieje przynależność do zbioru "Jasne"
  // - poziom światła jest wyższy niż optimum
  const isBright = (lightMap["Jasne"] ?? 0) > EPS && Number(light) > lightOptimalCenter;

  // Wyświetlanie/chowanie ikon
  if (potShade) {
    potShade.style.display = isDark ? "block" : "none";
  }

  if (potSun) {
    potSun.style.display = isBright ? "block" : "none";
  }
}
