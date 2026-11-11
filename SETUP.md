# Einrichtung: Elli lernt laufen

Etwa 15 Minuten. Du brauchst ein Google-Konto und deinen GitHub-Zugang.

## 1. Google Tabelle für die Bestenliste

1. Öffne <https://sheets.new> und nenne die Tabelle z. B. **Elli Bestenliste**.
2. Menü **Erweiterungen → Apps Script**.
3. Lösche den vorhandenen Code und füge den kompletten Inhalt von
   [`apps-script/Code.gs`](apps-script/Code.gs) ein. Speichern (Disketten-Symbol).
4. Oben rechts **Bereitstellen → Neue Bereitstellung**.
   - Zahnrad neben „Typ auswählen“ → **Web-App**
   - Beschreibung: `Bestenliste`
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
   - **Bereitstellen** klicken
5. Google fragt nach Berechtigungen: **Zugriff autorisieren** → dein Konto wählen.
   Kommt die Warnung „Google hat diese App nicht überprüft“: **Erweitert → Zu … (unsicher) wechseln → Zulassen**.
   Das ist normal, weil es dein eigenes Skript ist.
6. Kopiere die **Web-App-URL** (endet auf `/exec`).

Test: Die URL im Browser öffnen. Es sollte `{"ok":true,"top":[]}` erscheinen.
Das Tabellenblatt „Bestenliste“ wird beim ersten Eintrag automatisch angelegt.

## 2. URL ins Spiel eintragen

Datei [`config.js`](config.js) öffnen (auf GitHub: Stift-Symbol „Edit“) und die URL einsetzen:

```js
window.ELLI_CONFIG = {
  scoreUrl: "https://script.google.com/macros/s/…/exec"
};
```

Oder schick mir die URL, dann trage ich sie ein.

## 3. GitHub Pages einschalten

1. Im Repo **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: den Branch mit dem Spiel wählen (z. B. `main` nach dem Zusammenführen), Ordner **/ (root)** → **Save**.
4. Nach 1–2 Minuten ist das Spiel erreichbar unter
   **<https://syuux77.github.io/Elli1/>**

## 4. QR-Karte drucken

<https://syuux77.github.io/Elli1/qr.html> öffnen → **Drucken**.
Zwei A6-Karten pro A4-Seite.

## 5. Generalprobe (Fr 13.11.)

- Auf iPhone **und** Android spielen, einmal mit „Neigen“.
- Ein paar Einträge machen und in der Tabelle nachsehen.
- **Vor der Feier Testeinträge löschen:** in der Tabelle die Zeilen ab Zeile 2 löschen (Kopfzeile behalten).

## Gut zu wissen

- **Code geändert?** Bei Änderungen an `Code.gs`: **Bereitstellen → Bereitstellungen verwalten → Bearbeiten (Stift) → Version: Neue Version → Bereitstellen**. Die URL bleibt gleich.
- **Ohne Internet** läuft das Spiel weiter. Einträge werden gespeichert und später automatisch gesendet.
- **Schummelschutz:** Einträge, deren Punkte nicht zur Spieldauer passen, werden abgelehnt. Ein festes Punktelimit gibt es nicht.
- **Unerwünschter Eintrag?** Einfach die Zeile in der Tabelle löschen.
- **Schwierigkeit anpassen:** Alle Werte stehen oben in `js/game.js` im Block `const T = { … }`.
