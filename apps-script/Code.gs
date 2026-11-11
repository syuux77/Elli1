/**
 * Elli lernt laufen – Bestenliste in einer Google Tabelle.
 *
 * Einrichtung siehe SETUP.md:
 *  1. Google Tabelle anlegen → Erweiterungen → Apps Script
 *  2. Diesen Code einfügen, speichern
 *  3. Bereitstellen → Neue Bereitstellung → Web-App
 *     Ausführen als: Ich · Zugriff: Jeder
 */

var SHEET_NAME = 'Bestenliste';
var HEADER = ['Zeit', 'Name', 'Punkte', 'Ziele', 'Runde', 'Dauer (s)', 'Schritte', 'Steuerung'];
var TOP_N = 10;
// Schummelschutz ohne festes Punktelimit: maximal so viele Punkte pro Sekunde Spielzeit.
var MAX_POINTS_PER_SECOND = 400;
var MAX_POINTS_BASE = 1500;

function doGet(e) {
  return json_({ ok: true, top: top_(TOP_N) });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(8000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    var name = String(d.name || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
    var score = Math.round(Number(d.score));
    var duration = Number(d.duration);
    var goals = Math.max(0, Math.round(Number(d.goals) || 0));
    var round = Math.max(1, Math.round(Number(d.round) || 1));
    var steps = Math.max(0, Math.round(Number(d.steps) || 0));
    var mode = d.mode === 'tilt' ? 'Neigen' : 'Tippen';

    if (!name) return json_({ ok: false, error: 'Name fehlt' });
    if (!isFinite(score) || score < 0) return json_({ ok: false, error: 'Ungültige Punktzahl' });
    if (!isFinite(duration) || duration < 1) return json_({ ok: false, error: 'Ungültige Dauer' });
    if (score > MAX_POINTS_BASE + MAX_POINTS_PER_SECOND * duration) return json_({ ok: false, error: 'Punktzahl unplausibel' });

    sheet_().appendRow([new Date(), name, score, goals, round, Math.round(duration), steps, mode]);
    return json_({ ok: true, top: top_(TOP_N) });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADER.length).setFontWeight('bold');
  }
  return sh;
}

// Bester Versuch pro Name, absteigend sortiert
function top_(n) {
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, 4).getValues();
  var best = {};
  rows.forEach(function (r) {
    var name = String(r[1]).trim();
    if (!name) return;
    var key = name.toLowerCase();
    var score = Number(r[2]) || 0;
    if (!best[key] || score > best[key].score) best[key] = { name: name, score: score, goals: Number(r[3]) || 0 };
  });
  return Object.keys(best).map(function (k) { return best[k]; })
    .sort(function (a, b) { return b.score - a.score; })
    .slice(0, n);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
