# Webcrawler-Libary

**Opis projektu**:

Jest to aplikacja server-sidow'a napisana w środowisku Node.js.
Sama aplikacja jest podzielona na pod procesy, każdy proces odpowiada za inny aspekt aplikacji. Komunikacja między procesami jest osiągnietą dzięki użyciu protokołu HTTP. Głównym celem aplikacji jest udostępnienie interfejsu dla webcrawler'a, który przeszukuje dane adresy URL w celu znalezienia dla nas poszczególnej informacji na stronie. Wszystkie dane są zapisywane w bazie danych MySQL. Zasoby zebrane przez WebCrawler'a można pobrać za pomocą REST Api używając protokołu HTTP w udostępnionych w tym celu Routach. Można również wydobyte dane manipulować i podmieniać na własne wartości, jeśli trzeba coś zmienić.

**Użyte technologie**:
- Express.js - jako serwer http.
- puppeteer - interfejs przeglądarki internetowej Chromium
- async-request - do komunikacji protokołem http między procesami
- Cheerio - manipulacja DOM'em
- mysql - client dla baz danych sql


