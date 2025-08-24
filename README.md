

# Väderdashboard

En enkel, responsiv väderdashboard byggd med Next.js, TypeScript och Tailwind CSS. Använder gratis Open-Meteo API (ingen API-nyckel krävs) för att visa aktuellt väder för valfri stad.


## Funktioner
- Sök väder med stadsnamn
- Visar temperatur, vindhastighet och vindriktning

## Struktur enligt följande

.next/
app/
	globals.css
	layout.tsx
	page.tsx
components/
	WeatherApp.tsx

## Förslag på förbättringar

- Lägg till stöd för väderprognos (flera dagar framåt)
- Visa väderikoner baserat på väderkod
- Lägg till mörkt läge
- Spara senaste sökta städer
- Lägg till felhantering och användarvänliga meddelanden


