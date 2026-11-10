/**
 * Google Apps Script backend for the wedding e-card (header-aware version).
 * Bound to a Google Sheet: Extensions > Apps Script, paste this file, then Deploy > Manage deployments >
 * edit > New version (Execute as: Me, Who has access: Anyone). Copy the /exec URL into js/config.js.
 *
 * On an empty sheet it creates these columns in this order: note, id, updatedAt, name, phone number, attending (yes/no),
 * guests (number), which part will you join, food allergy.
 * It writes into the sheet named SHEET below, matching columns by their header text in row 1, so your own
 * headers (e.g. "phone number", "which part will you join", "food allergy") are used as they are.
 * Any column it needs that is missing is added at the end. A guest who replies again updates their own row.
 */
var SHEET = "";   // leave empty to use the first sheet; or put a tab name such as "RSVP"

// Column order for a new/empty sheet (field, header names it may match, header it creates)
var FIELDS = [
  ["note",      ["note", "message", "wishes", "blessing", "leave your wishes here"], "note"],
  ["id",        ["id", "guest id"],                                                   "id"],
  ["updatedAt", ["updatedat", "updated at", "timestamp", "time", "date"],            "updatedAt"],
  ["name",      ["name", "full name", "your name"],                                  "name"],
  ["phone",     ["phone", "phone number", "tel", "telephone", "mobile"],             "phone number"],
  ["attending", ["attending", "attend", "will you attend", "attendance", "response"], "attending"],        // yes / no
  ["guests",    ["guests", "number of guests", "guest", "how many guests"],          "guests"],           // number
  ["sessions",  ["sessions", "which part will you join", "part", "parts"],           "which part will you join"],
  ["diet",      ["diet", "food allergy", "food allergies", "dietary needs"],         "food allergy"],
];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = SHEET ? (ss.getSheetByName(SHEET) || ss.insertSheet(SHEET)) : ss.getSheets()[0];
  if (sh.getLastColumn() === 0 || (sh.getLastRow() === 0)) {
    var heads = FIELDS.map(function (f) { return f[2]; });
    sh.getRange(1, 1, 1, heads.length).setValues([heads]);
    sh.setFrozenRows(1);
  }
  return sh;
}

// returns {field: columnIndex(1-based)}, adding missing columns to the header row
function columns_(sh) {
  var head = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0]
    .map(function (h) { return String(h).trim().toLowerCase(); });
  var map = {};
  FIELDS.forEach(function (f) {
    var idx = -1;
    for (var i = 0; i < head.length && idx < 0; i++) if (f[1].indexOf(head[i]) >= 0 && !isUsed_(map, i + 1)) idx = i;
    if (idx < 0) {
      var c = sh.getLastColumn() + 1;
      if (sh.getLastRow() === 1 && head.length === 1 && head[0] === "" ) c = 1;
      sh.getRange(1, c).setValue(f[2]);
      head[c - 1] = f[2].toLowerCase();
      idx = c - 1;
    }
    map[f[0]] = idx + 1;
  });
  return map;
}
function isUsed_(map, col) { for (var k in map) if (map[k] === col) return true; return false; }

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse(e.postData.contents);
    if (d.action !== "rsvp" || !d.id || !d.name) return json_({ ok: false, error: "bad request" });
    var sh = sheet_(), col = columns_(sh);
    var vals = {
      id: String(d.id).slice(0, 80),
      updatedAt: d.updatedAt || new Date().toISOString(),
      name: String(d.name).slice(0, 120),
      phone: String(d.phone || "").slice(0, 30),
      attending: d.attending ? "yes" : "no",
      guests: Number(d.guests) || 0,
      sessions: (d.sessions || []).join(", "),
      diet: String(d.diet || d.foodAllergy || d["food allergy"] || "").slice(0, 200),
      note: String(d.note || "").slice(0, 500)
    };
    sh.getRange(1, col.phone, sh.getMaxRows(), 1).setNumberFormat("@");   // keep a leading 0 in phone numbers
    var last = sh.getLastRow(), at = -1;
    if (last > 1) {
      var ids = sh.getRange(2, col.id, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === vals.id) { at = i + 2; break; }
    }
    if (at < 0) at = last + 1;
    for (var k in vals) sh.getRange(at, col[k]).setValue(vals[k]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet(e) {
  // nothing is public: answers are only visible in the Google Sheet itself
  return json_({ ok: true });
}
