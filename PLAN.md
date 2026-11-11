# Elli lernt laufen – Plan

Handy-Balance-Spiel zu Ellis 1. Geburtstag (Feier am 14.11.). Gäste scannen einen QR-Code,
helfen Elli beim Laufen und tragen sich in eine gemeinsame Bestenliste ein.

**Designentwurf:** [`docs/designentwurf.html`](docs/designentwurf.html) (vier Screens: Start, Spiel, Plumps!, Bestenliste)

## Spielidee (Variante A: Hand reichen)
- Elli läuft automatisch, wackelt dabei wie ein umgedrehtes Pendel.
- Tippen links oder rechts fängt sie auf. Über 45° Neigung heißt es „Plumps!“.
- Punkte: 1 pro Schritt, Luftballon +5, Keks macht 3 s ruhiger.
- Es wird schneller und wackliger. Bauklötze und Teppichkanten geben einen Stolper-Stoß.
- Optional: Handy neigen (Lagesensor, iOS-Erlaubnis nötig).

## Technik
QR-Code → GitHub Pages (`https://syuux77.github.io/Elli1/`) → Google Apps Script Web-App → Google Tabelle
- Pures HTML/Canvas/JS, keine Abhängigkeiten.
- `doGet` liefert die Top 10 (bester Versuch pro Name), `doPost` speichert `{name, score}`.
- POST mit `text/plain`-Body, damit kein CORS-Preflight entsteht.
- Prüfung im Skript: Name max. 16 Zeichen, Punktzahl plausibel. Bei fehlendem Netz später nachsenden.

## Zeitplan
| Wann | Was |
|---|---|
| Mi 11.11. | Designentwurf & Plan, Feedback, danach Spiel-Prototyp |
| Do 12.11. | Google Tabelle + Apps Script, GitHub Pages, QR-Code, Feinschliff |
| Fr 13.11. | Generalprobe auf iPhone & Android, Testeinträge löschen, QR-Aufsteller drucken |
| Sa 14.11. | Feier: spielen, Siegerehrung zum Kuchen |

## Offene Fragen
1. Variante A (Hand reichen) oder B (abwechselnd tippen = Schritte)?
2. Ellis Aussehen: Haarfarbe, Lieblingsfarbe, Kuscheltier?
3. Ziel (zu Mama/Papa/Torte) oder endlos laufen?
4. Sound standardmäßig an oder aus?
5. Google-Konto für die Tabelle vorhanden?
