// Plik bootstrap.js odpowiedzialny jest za kolejność ładowania skryptów, po wcześneijszym załadowaniu bibliotek.

const scripts = [
  "js/script.js",
  "js/addons.js",
  "js/actions.js",
  "js/time.js",
  "js/pot.js",
  "js/chart.js",
  "js/update.js",
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => {
        console.log("Załadowano:", src); 
        resolve();
    };
    s.onerror = () => {
      console.error("Błąd ładowania:", src);
      reject(new Error(`Nie udało się załadować ${src}`));
    };
    document.body.appendChild(s);
  });
}

async function loadAll() {
  console.log("Ładowanie skryptów...");
  for (const src of scripts) {
    await loadScript(src);
  }
}

if (window.fuzzyReady) {
  loadAll();
} else {
  document.addEventListener("fuzzy-ready", loadAll, { once: true });
}