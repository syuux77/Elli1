# Elli lernt laufen – Plan (Version 2)

Handy-Balance-Spiel zu Ellis 1. Geburtstag (Feier am 14.11.). Gäste scannen einen QR-Code,
bringen Elli zu Mama, Papa, Ruby und Trude und tragen sich in eine gemeinsame Bestenliste ein.

**Designentwurf:** [`docs/designentwurf.html`](docs/designentwurf.html)
(fünf Screens: Start, Spiel, Ziel erreicht, Plumps!, Bestenliste)

## Figuren & Look
- **Elli:** dunkelblond, Marienkäfer-Kleidchen mit „1“, rosa Schleife. Liebt Marienkäfer und Tomaten, Kuscheltier: kleine Giraffe.
- **Ziele:** Mama, Papa, große Schwester Ruby (4), Hund Trude (Mopsmischling).
- Pastellstil, Wohnzimmer mit Holzboden und Wimpelkette. **Kein Ton.**

## Steuerung
- **Tippen (Standard):** rechts = nach vorne lehnen, links = zurück. Elli verhält sich wie ein umgedrehtes Pendel, über 45° heißt es „Plumps!“.
- Wildes Tippen übersteuert. Ruhige, gezielte Korrekturen gewinnen.
- **Zusatzmodus „Neigen“:** Lagesensor, wird auf dem Startscreen gewählt. Fragt auf dem iPhone nach der Erlaubnis, fällt bei Ablehnung auf Tippen zurück.

## Sichtbare Fortbewegung
- Laufzyklus: Beine abwechselnd, Arme rudern, Körper wippt.
- Seitlich scrollende Welt mit Parallax (Boden, Möbel, Wimpel). Die Kamera folgt Elli.
- Tempo hängt von der Neigung ab: Vorlage macht schneller, Rücklage langsamer.
- Das Ziel erscheint am rechten Rand mit ausgestreckten Armen.

## Ziele & Runden
- Runde 1: Mama → Papa → Ruby → Trude. Jedes Ziel: kurzer Jubel (ca. 1,5 s), Bonus, weiter.
- Danach Runde 2, 3, … endlos: längere Wege, mehr Tempo, mehr Wackeln.
- Störungen: Bauklötze/Teppichkanten (Stolper-Stoß), **Trude flitzt vorbei** (Elli erschrickt), Ruby winkt (Elli lehnt zurück).

## Punkte ohne Obergrenze
| Quelle | Punkte |
|---|---|
| Schritt | 1 (mehr Schritte/s bei Vorlage) |
| Tomate (auf dem Weg) | 3 |
| Marienkäfer (Kopfhöhe, nur bei deutlicher Vorlage fangbar) | 15 |
| Kuschel-Giraffe (selten) | 4 s ruhiger |
| Ziel erreicht | 50 × Runde |

- **Multiplikator „Ruhige Hand“:** ×1 bis ×5, steigt alle 10 s ohne roten Bereich, fällt bei Beinahe-Sturz auf ×1.
- **Kein optimaler Lauf:** zufällige Platzierung jedes Laufs, endlose Runden, Schwierigkeit ohne Deckel, Risiko gegen Sicherheit.
- Startwerte der Runden: Weg 30/40/50 Schritte (+10 je Runde), Tempo +15 % je Runde. Wird nach Tests so abgestimmt, dass Oma Runde 1 schafft und geübte Spieler Runde 3–4 erreichen.

## Technik
QR-Code → GitHub Pages (`https://syuux77.github.io/Elli1/`) → Google Apps Script Web-App → Google Tabelle
- Pures HTML/Canvas/JS, keine Abhängigkeiten.
- `doGet` liefert die Top 10 (bester Versuch pro Name), `doPost` speichert `{name, score, goal, round, durationMs, mode}`.
- POST mit `text/plain`-Body, damit kein CORS-Preflight entsteht.
- Schummelschutz ohne Punktelimit: Punkte müssen zur Spieldauer passen (maximaler Punkte-pro-Sekunde-Wert). Name max. 16 Zeichen.
- Ohne Netz läuft das Spiel weiter, die Punkte werden später nachgesendet.

## Zeitplan
| Wann | Was |
|---|---|
| Mi 11.11. | Plan v2, danach Prototyp: Physik, Laufzyklus, scrollende Welt, Ziele, Punkte |
| Do 12.11. | Google Tabelle + Apps Script, GitHub Pages, QR-Code, Neigen-Modus, Feinschliff |
| Fr 13.11. | Generalprobe auf iPhone & Android, Testeinträge löschen, QR-Aufsteller drucken |
| Sa 14.11. | Feier: spielen, Siegerehrung zum Kuchen |

## Stand
- [x] Designentwurf & Plan
- [x] Spiel (Physik, Laufzyklus, Ziele, Punkte, Neigen-Modus, Bestenliste, QR-Karte)
- [x] Google Tabelle + Apps Script eingerichtet
- [ ] GitHub Pages einschalten
- [ ] Generalprobe auf iPhone & Android

## Optionale Fragen
1. Aussehen von Mama, Papa, Ruby (Haarfarbe, Brille, Zöpfe …)?
2. Trudes Fellfarbe?
3. Preis für Platz 1?
