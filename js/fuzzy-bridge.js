// Plik fuzzy-bridge.js odpowiedzialny jest za pobranie bibliotek @thi.ng fuzzy i fuzzy-viz.
// Przydatne linki:
// https://docs.thi.ng/umbrella/fuzzy/modules.html
// https://codeberg.org/thi.ng/umbrella/src/branch/develop/packages/fuzzy-viz#about

import * as fuzzy from "https://esm.run/@thi.ng/fuzzy";
import * as fuzzyViz from "https://esm.run/@thi.ng/fuzzy-viz";

// wystawiamy bibliotekę globalnie
window.fuzzyLib = fuzzy;
window.fuzzyVizLib = fuzzyViz;

// informacja, że fuzzy jest gotowe
window.fuzzyReady = true;

console.log("Fuzzy gotowe:", !!window.fuzzyLib);
console.log("FuzzyViz gotowe:", !!window.fuzzyVizLib);

document.dispatchEvent(new Event("fuzzy-ready"));