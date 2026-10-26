# Camerakaart

Een website met een kaart van openbare webcams in Nederland. Klik op een camera en je ziet het live beeld.
Later volgt een dashboard waarop je camera's in vensters zet die je vrij kunt verplaatsen en vergroten.

De site toont alleen camera's die de eigenaar zelf openbaar heeft gemaakt (officiële webcams,
verkeers- en stadscamera's, webcamdiensten met een API). Camera's die alleen bereikbaar zijn omdat ze
slecht beveiligd zijn, horen hier niet thuis. Het beeld komt rechtstreeks van de aanbieder; de site slaat
zelf geen beelden op.

## Lokaal draaien

```bash
npm install
npm run dev
```

## Waar de camera's vandaan komen

- `data/manual-cameras.json`: officiële webcams die we zelf vastleggen, met bron en naamsvermelding.
- [Windy Webcams API](https://api.windy.com/webcams): webcams in Nederland. Hiervoor is een gratis
  API-sleutel nodig.
- Camera's die je in de site zelf toevoegt (knop "Camera toevoegen"). Die staan alleen in jouw browser.

`npm run import` voegt de eerste twee samen in `public/cameras.json`:

```bash
WINDY_API_KEY=jouw-sleutel npm run import
```

Op GitHub doet de workflow **Cameralijst bijwerken** dit elke nacht. Zet daarvoor de sleutel als
repository secret `WINDY_API_KEY` (Settings → Secrets and variables → Actions).

Ondersteunde streamformaten: HLS (`.m3u8`), YouTube-livestreams, embeds van de aanbieder, MJPEG en
snapshots die periodiek verversen. RTSP werkt niet in de browser en wordt niet ondersteund.

## Publiceren

Elke push naar `main` zet de site op GitHub Pages. Kies eenmalig in Settings → Pages bij "Source" voor
**GitHub Actions**.

## Techniek

React met TypeScript en Vite, MapLibre GL met OpenStreetMap-kaarttegels, hls.js voor HLS-streams.
