/**
 * Google Apps Script backend for the wedding e-card.
 * Bound to a Google Sheet: Extensions > Apps Script, paste this file, then Deploy > New deployment >
 * Web app (Execute as: Me, Who has access: Anyone). Copy the /exec URL into js/config.js.
 *
 * The sheet "RSVP" gets one row per guest (a guest who replies again updates their own row).
 * Column J "hide" lets you hide a blessing from the public list: type TRUE in that cell.
 */
var SHEET = "RSVP";
var HEADERS = ["id", "updatedAt", "name", "phone", "attending", "guests", "sessions", "diet", "note", "hide"];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  sh.getRange("D:D").setNumberFormat("@");   // phone as plain text, so a leading 0 is never dropped
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse(e.postData.contents);
    if (d.action !== "rsvp" || !d.id || !d.name) return json_({ ok: false, error: "bad request" });
    var sh = getSheet_();
    var row = [
      String(d.id).slice(0, 80), d.updatedAt || new Date().toISOString(),
      String(d.name).slice(0, 120), String(d.phone || "").slice(0, 30),
      d.attending ? "yes" : "no", Number(d.guests) || 0,
      (d.sessions || []).join(", "), String(d.diet || "").slice(0, 200), String(d.note || "").slice(0, 500)
    ];
    var ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
    var at = -1;
    for (var i = 0; i < ids.length; i++) if (ids[i][0] === row[0]) { at = i + 2; break; }
    if (at > 0) sh.getRange(at, 1, 1, row.length).setValues([row]);   // keeps the "hide" cell as it was
    else sh.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.action !== "wishes") return json_({ ok: true });
  var sh = getSheet_();
  var n = sh.getLastRow() - 1;
  if (n < 1) return json_({ ok: true, wishes: [] });
  var rows = sh.getRange(2, 1, n, HEADERS.length).getValues();
  var wishes = [];
  rows.forEach(function (r) {
    var note = String(r[8] || "").trim();
    if (!note || String(r[9]).toUpperCase() === "TRUE") return;
    wishes.push({ name: r[2], note: note, at: new Date(r[1]).getTime() || 0 });
  });
  wishes.sort(function (a, b) { return b.at - a.at; });
  return json_({ ok: true, wishes: wishes.slice(0, 100) });   // only name + message are ever public
}
