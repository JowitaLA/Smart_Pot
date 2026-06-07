# Inteligentna doniczka oparta na zbiorach rozmytych

**Autor:** Jowita Kruk  
**Numer albumu:** 339351  
**Przedmiot:** Zbiory i Systemy Rozmyte  
**Rok akademicki:** 2025/2026  

---

## Opis projektu

Projekt przedstawia symulator inteligentnej doniczki działający w oparciu o logikę rozmytą.  
Celem aplikacji jest modelowanie podstawowych warunków środowiskowych wpływających na roślinę oraz automatyczne podejmowanie decyzji sterujących urządzeniami wspomagającymi jej rozwój.

System analizuje trzy główne parametry środowiska:

- wilgotność gleby,
- poziom światła,
- temperaturę.

Na podstawie zbiorów rozmytych i funkcji przynależności aplikacja ocenia aktualny stan rośliny, wyznacza poziom komfortu lub stresu, steruje urządzeniami w trybie SMART oraz aktualizuje zdrowie rośliny w czasie.

Projekt ma charakter edukacyjno-symulacyjny i pokazuje praktyczne zastosowanie zbiorów rozmytych w systemie sterowania.

---

## Główne funkcjonalności

Aplikacja umożliwia:

### Sterowanie wilgotnością gleby
- podlewanie rośliny,
- odpompowywanie nadmiaru wody,
- automatyczne sterowanie wilgotnością w trybie SMART.

### Sterowanie światłem
- zasłanianie i odsłanianie rolety,
- włączanie i wyłączanie sztucznego oświetlenia,
- automatyczne sterowanie roletą i lampą w zależności od pory dnia i aktualnych warunków.

### Sterowanie temperaturą
- dogrzewanie rośliny za pomocą lampy,
- chłodzenie przy użyciu wentylatora,
- zraszanie wspomagające regulację temperatury i wilgotności,
- automatyczne sterowanie temperaturą w trybie SMART.

### Symulację środowiska
- zmienność warunków w zależności od pory roku,
- zmiany temperatury, światła i wilgotności w czasie,
- obsługę własnych parametrów środowiskowych w trybie niestandardowym.

### Wizualizację działania systemu
- wykres historii parametrów,
- wykresy zbiorów rozmytych,
- notyfikacje ostrzegające o niekorzystnych warunkach,
- graficzny stan rośliny i doniczki.

---

## Zastosowanie zbiorów rozmytych

W projekcie zbiory rozmyte zostały wykorzystane do opisu warunków środowiskowych w sposób bardziej naturalny niż klasyczne sterowanie progowe.

Zamiast prostych reguł typu:

- „jeśli temperatura < 15°C, włącz grzanie”,
- „jeśli wilgotność < 30%, podlej”,

zastosowano opisy lingwistyczne, takie jak:

### Wilgotność gleby
- Suche
- Optymalne
- Mokre

### Światło
- Ciemne
- Optymalne
- Jasne

### Temperatura
- Zimno
- Optymalne
- Gorąco

Dzięki temu jedna wartość może jednocześnie należeć częściowo do kilku zbiorów, np. być jednocześnie trochę „ciemna” i trochę „optymalna”. Na tej podstawie system podejmuje bardziej płynne i realistyczne decyzje.

---

## Obsługiwane rośliny

Projekt pozwala symulować warunki dla trzech różnych roślin:

- storczyk,
- kaktus,
- paprotka.

Każda z nich posiada osobne konfiguracje zbiorów rozmytych i inne wymagania dotyczące:
- wilgotności gleby,
- temperatury,
- światła.

Dzięki temu system nie traktuje wszystkich roślin jednakowo i może symulować różnice między ich preferencjami środowiskowymi.

---

## Tryb SMART

Tryb SMART przejmuje kontrolę nad urządzeniami i automatycznie reaguje na zmiany warunków.

W zależności od poziomu przynależności do odpowiednich zbiorów rozmytych system może:

- uruchomić podlewanie lub odpompowywanie,
- włączyć wentylację lub zraszanie,
- uruchomić doświetlanie,
- aktywować dogrzewanie,
- sterować roletą.

Tryb SMART korzysta z aktualnych membershipów fuzzy oraz porównania bieżących parametrów ze środkiem zbiorów optymalnych.

---

## Pory roku i tryb własny

Projekt uwzględnia cztery podstawowe pory roku:

- zima,
- wiosna,
- lato,
- jesień.

Każda pora roku posiada osobne:
- zakresy temperatur,
- harmonogramy światła w ciągu doby,
- tempo spadku wilgotności gleby.

Dodatkowo aplikacja udostępnia tryb własnych parametrów, umożliwiający ustawienie:
- minimalnej i maksymalnej temperatury,
- minimalnego i maksymalnego światła,
- szybkości ubytku wilgotności gleby.

Pozwala to testować niestandardowe scenariusze środowiskowe.

---

## Funkcje urządzeń

### Układ nawodnienia
- podlewanie,
- odpompowywanie.

### Układ wentylatora
- wentylacja,
- zraszanie.

### Układ oświetlenia i temperatury
- sztuczna lampa,
- ogrzewanie lampą,
- sterowanie roletą.

Każde z urządzeń może działać ręcznie lub w trybie automatycznym.

---

## Wizualizacja i interfejs

Interfejs aplikacji zawiera:

- główny widok rośliny i doniczki,
- zegar z godziną, temperaturą, dniem i porą roku,
- przyciski sterujące urządzeniami,
- panel wykresów,
- komunikaty o stanie systemu,
- wizualne ostrzeżenia umieszczone bezpośrednio na doniczce.

Dzięki temu użytkownik może jednocześnie obserwować:
- aktualne warunki,
- reakcję urządzeń,
- stan zdrowia rośliny,
- wykresy historii i zbiory rozmyte.

---

## Struktura projektu

Najważniejsze pliki projektu:

- `index.html` - struktura aplikacji,
- `style.css` - wygląd interfejsu,
- `fuzzy-bridge.js` - połączenie z bibliotekami fuzzy,
- `bootstrap.js` - ładowanie skryptów,
- `script.js` - konfiguracja roślin i funkcje przynależności,
- `addons.js` - zmiana rośliny, sezonu i ustawień własnych,
- `actions.js` - logika urządzeń i trybu SMART,
- `time.js` - logika czasu, sezonów i środowiska,
- `pot.js` - status doniczki i notyfikacje,
- `chart.js` - wykres historii i wykresy rozmyte,
- `update.js` - aktualizacja interfejsu użytkownika.

---

## Technologie

Projekt został wykonany z użyciem:

- HTML5,
- CSS3,
- JavaScript,
- Chart.js,
- `@thi.ng/fuzzy`,
- `@thi.ng/fuzzy-viz`,
- Bootstrap.

---

## Charakter projektu

Projekt nie jest modelem biologicznym w pełnym znaczeniu naukowym.  
Jego celem jest przede wszystkim pokazanie, w jaki sposób zbiory rozmyte mogą zostać wykorzystane w systemie symulacyjnym i sterującym.

Najważniejszą wartością projektu jest:
- wykorzystanie logiki rozmytej do interpretacji warunków,
- powiązanie fuzzy logic z działaniem urządzeń,
- wizualizacja wyników i stanów systemu.

---

## Możliwe kierunki rozwoju

Projekt można w przyszłości rozszerzyć m.in. o:

- większą liczbę roślin,
- bardziej złożone reguły rozmyte,
- defuzyfikację sygnałów wyjściowych,
- zapis historii do pliku,
- raporty z przebiegu symulacji,
- dalsze rozwinięcie modelu środowiskowego.

---

## Podsumowanie

Inteligentna doniczka oparta na zbiorach rozmytych jest przykładem zastosowania logiki rozmytej w systemie, który:
- analizuje warunki środowiska,
- ocenia stan rośliny,
- steruje urządzeniami,
- reaguje na zmiany w czasie,
- wizualizuje wyniki działania.

Projekt pokazuje, że fuzzy logic może być skutecznie wykorzystana nie tylko do opisu stanów, ale również do sterowania i wspomagania decyzji w systemie symulacyjnym.