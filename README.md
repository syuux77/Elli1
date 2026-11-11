# Elli lernt laufen

Ein kleines Balance-Spiel fürs Handy zu Ellis 1. Geburtstag.
Gäste scannen einen QR-Code, bringen Elli zu Mama, Papa, Ruby und Trude und tragen sich in eine gemeinsame Bestenliste ein.

- **Spielen:** `index.html` (läuft im Browser, ohne App und ohne Ton)
- **QR-Karte:** `qr.html`
- **Einrichtung:** [SETUP.md](SETUP.md) (Google Tabelle, GitHub Pages)
- **Plan & Designentwurf:** [PLAN.md](PLAN.md), [docs/designentwurf.html](docs/designentwurf.html)

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Oberfläche und Styles |
| `js/game.js` | Spiel-Logik, Physik, Zeichnen, Bestenliste (Stellschrauben oben in `T`) |
| `js/art.js` | Alle Figuren und Gegenstände als SVG (Farben oben in `C`) |
| `config.js` | Adresse der Google-Web-App |
| `apps-script/Code.gs` | Backend für die Google Tabelle |
| `js/vendor/qrcode-generator.js` | QR-Code-Bibliothek (MIT, Kazuhiko Arase) |

Lokal testen: `python3 -m http.server` im Ordner starten und <http://localhost:8000> öffnen.
