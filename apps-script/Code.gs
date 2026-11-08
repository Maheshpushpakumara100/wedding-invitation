/**
 * ============================================================
 *  Dhananjani & Mahesh — Wedding Guest API (Google Apps Script)
 * ============================================================
 *
 *  What this does
 *  - Stores the guest list in a Google Sheet.
 *  - Public read endpoint so the invitation can greet a guest by
 *    their personal link (?g=CODE). Supports JSONP, so it works
 *    even when cross-origin fetch is blocked.
 *  - Password-protected admin API used by admin.html to sign in
 *    (username + password) and add / edit / delete guests.
 *
 *  FIRST-TIME SETUP
 *  1. Open https://script.google.com and create a new project.
 *  2. Delete the default code, paste this whole file, then save.
 *  3. Change DEFAULT_ADMIN_USERNAME / DEFAULT_ADMIN_PASSWORD below.
 *  4. Select the `setup` function and click Run. Authorise it.
 *     A Google Sheet named "D&M Wedding Guest List" is created and
 *     its ID is stored in Script Properties.
 *  5. Deploy > New deployment > type "Web app".
 *       - Description:     Wedding API
 *       - Execute as:      Me
 *       - Who has access:  Anyone
 *     Copy the /exec URL.
 *  6. Paste that URL into assets/config.js as API_URL.
 *
 *  CHANGE THE PASSWORD LATER
 *  - Use the "Change password" form on admin.html, or
 *  - edit NEW_ADMIN_USERNAME / NEW_ADMIN_PASSWORD below and run
 *    `resetAdminCredentials` from the editor.
 *
 *  NOTE: Apps Script web apps cannot send custom CORS headers from
 *  a text response, so the browser client sends "simple" requests
 *  (text/plain / form-encoded) that avoid the CORS preflight.
 * ============================================================
 */

/* ----------------------- Configuration ----------------------- */

var SPREADSHEET_NAME = 'D&M Wedding Guest List';
var GUESTS_SHEET = 'Guests';
var SETTINGS_SHEET = 'Settings';
var GUEST_HEADERS = ['slug', 'salutation', 'name', 'display', 'phone', 'createdAt', 'updatedAt'];
var SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

// Used by setup() the very first time only.
var DEFAULT_ADMIN_USERNAME = 'admin';
var DEFAULT_ADMIN_PASSWORD = 'D&M2026';

// Used by resetAdminCredentials() when you run it from the editor.
var NEW_ADMIN_USERNAME = 'admin';
var NEW_ADMIN_PASSWORD = 'ChangeMe123!';

var PROP = PropertiesService.getScriptProperties();

/* --------------------------- Setup --------------------------- */

/**
 * Run this once from the Apps Script editor after pasting the code.
 * Creates the spreadsheet + tabs and the first admin credentials.
 */
function setup() {
  var ss = getOrCreateSpreadsheet_();
  ensureSheet_(ss, GUESTS_SHEET, GUEST_HEADERS);
  ensureSheet_(ss, SETTINGS_SHEET, ['key', 'value']);
  ensureDefaultSettings_(ss);

  if (!PROP.getProperty('ADMIN_USERNAME')) {
    setAdminCredentials_(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
  }

  var url = ss.getUrl();
  Logger.log('Guest list spreadsheet: ' + url);
  Logger.log('Admin username: ' + PROP.getProperty('ADMIN_USERNAME'));
  Logger.log('Now deploy as a Web App and paste the /exec URL into assets/config.js');
  return url;
}

/**
 * Update the admin username/password from the editor.
 * Edit NEW_ADMIN_USERNAME / NEW_ADMIN_PASSWORD, then run this.
 */
function resetAdminCredentials() {
  setAdminCredentials_(NEW_ADMIN_USERNAME, NEW_ADMIN_PASSWORD);
  Logger.log('Admin credentials updated. Username: ' + NEW_ADMIN_USERNAME);
  return true;
}

function getOrCreateSpreadsheet_() {
  var id = PROP.getProperty('SPREADSHEET_ID');
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      // fall through and create a new one
    }
  }
  var ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  PROP.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function getSpreadsheet_() {
  var id = PROP.getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error('Backend is not set up yet. Run setup() in the Apps Script editor.');
  }
  return SpreadsheetApp.openById(id);
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  var firstRow = sheet.getLastRow() === 0 ? '' : sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var empty = sheet.getLastRow() === 0 || firstRow.every(function (v) { return v === ''; });
  if (empty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ensureDefaultSettings_(ss) {
  var sheet = ss.getSheetByName(SETTINGS_SHEET);
  var values = sheet.getDataRange().getValues();
  var keys = {};
  for (var i = 1; i < values.length; i++) {
    keys[String(values[i][0] || '')] = true;
  }
  var toAdd = [];
  if (!keys.siteBase) toAdd.push(['siteBase', '']);
  if (!keys.schema) toAdd.push(['schema', '1']);
  if (toAdd.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, toAdd.length, 2).setValues(toAdd);
  }
}

/* ------------------------ Admin auth ------------------------- */

function setAdminCredentials_(username, password) {
  username = String(username || '').trim();
  password = String(password || '');
  if (!username || !password) throw new Error('Username and password are required');
  var salt = Utilities.getUuid().replace(/-/g, '');
  PROP.setProperties({
    ADMIN_USERNAME: username,
    ADMIN_SALT: salt,
    ADMIN_HASH: hashPassword_(password, salt),
    ADMIN_UPDATED: new Date().toISOString()
  });
  return true;
}

function hashPassword_(password, salt) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(salt) + ':' + String(password),
    Utilities.Charset.UTF_8
  );
  return digest.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function createSession_(username) {
  var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  var exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  CacheService.getScriptCache().put(
    'sess_' + token,
    JSON.stringify({ username: username, exp: exp }),
    SESSION_TTL_SECONDS
  );
  return { token: token, username: username, expiresAt: exp };
}

function getSession_(token) {
  if (!token) return null;
  var raw = CacheService.getScriptCache().get('sess_' + token);
  if (!raw) return null;
  try {
    var s = JSON.parse(raw);
    if (!s.exp || s.exp < Date.now()) return null;
    return s;
  } catch (e) {
    return null;
  }
}

function destroySession_(token) {
  if (token) CacheService.getScriptCache().remove('sess_' + token);
}

function login_(payload) {
  var username = String(payload.username || '').trim();
  var password = String(payload.password || '');
  var storedUser = PROP.getProperty('ADMIN_USERNAME');
  var salt = PROP.getProperty('ADMIN_SALT');
  var hash = PROP.getProperty('ADMIN_HASH');

  if (!storedUser || !salt || !hash) {
    return { ok: false, error: 'not_configured' };
  }
  if (username.toLowerCase() !== storedUser.toLowerCase() || hashPassword_(password, salt) !== hash) {
    return { ok: false, error: 'invalid_credentials' };
  }

  var s = createSession_(storedUser);
  return {
    ok: true,
    token: s.token,
    username: s.username,
    expiresAt: s.expiresAt,
    guests: readGuests_(),
    settings: readSettings_()
  };
}

function changePassword_(payload) {
  var current = String(payload.currentPassword || '');
  var next = String(payload.newPassword || '');
  var salt = PROP.getProperty('ADMIN_SALT');
  var hash = PROP.getProperty('ADMIN_HASH');

  if (!salt || !hash) throw new Error('Admin is not configured yet');
  if (hashPassword_(current, salt) !== hash) throw new Error('Current password is incorrect');
  if (next.length < 6) throw new Error('New password must be at least 6 characters');

  setAdminCredentials_(PROP.getProperty('ADMIN_USERNAME'), next);
  return { ok: true };
}

/* ------------------------ Guest data ------------------------- */

function getGuestsSheet_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(GUESTS_SHEET);
  if (!sheet) sheet = ensureSheet_(ss, GUESTS_SHEET, GUEST_HEADERS);
  return sheet;
}

function readGuests_() {
  var sheet = getGuestsSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var values = sheet.getRange(2, 1, last - 1, GUEST_HEADERS.length).getValues();
  var out = [];
  values.forEach(function (row) {
    if (!row[0] && !row[3]) return;
    out.push({
      slug: String(row[0] || ''),
      salutation: String(row[1] || ''),
      name: String(row[2] || ''),
      display: String(row[3] || ''),
      phone: String(row[4] || ''),
      createdAt: toIso_(row[5]),
      updatedAt: toIso_(row[6])
    });
  });
  return out;
}

function writeGuests_(guests) {
  var sheet = getGuestsSheet_();
  var last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last - 1, GUEST_HEADERS.length).clearContent();
  if (!guests.length) return;
  var now = new Date().toISOString();
  var rows = guests.map(function (g) {
    return [
      g.slug,
      g.salutation,
      g.name,
      g.display,
      g.phone,
      g.createdAt || now,
      g.updatedAt || now
    ];
  });
  sheet.getRange(2, 1, rows.length, GUEST_HEADERS.length).setValues(rows);
}

function toIso_(value) {
  if (!value) return '';
  var d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

function slugify_(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function randomSuffix_() {
  return Math.random().toString(36).slice(2, 6);
}

function buildDisplay_(salutation, name) {
  name = String(name || '').trim();
  salutation = String(salutation || '').trim();
  if (!name) return salutation;
  if (!salutation) return name;
  if (salutation === 'Family of') return 'Family of ' + name;
  return salutation + ' ' + name;
}

function normalizeGuestInput_(guest) {
  guest = guest || {};
  var salutation = String(guest.salutation || '').trim();
  var name = String(guest.name || '').trim();
  var display = String(guest.display || '').trim() || buildDisplay_(salutation, name) || 'Guest';
  var slug = slugify_(guest.slug || '') ||
    (name ? slugify_(name) + '-' + randomSuffix_() : 'guest-' + randomSuffix_());
  return {
    slug: slug,
    salutation: salutation,
    name: name,
    display: display,
    phone: String(guest.phone || '').trim()
  };
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function listGuests_() {
  return { ok: true, guests: readGuests_(), settings: readSettings_() };
}

function addGuest_(payload) {
  return withLock_(function () {
    var guests = readGuests_();
    var guest = normalizeGuestInput_(payload.guest);
    if (!guest.name && !guest.display) throw new Error('Guest name is required');
    if (guests.some(function (g) { return g.slug === guest.slug; })) {
      guest.slug = guest.slug + '-' + randomSuffix_();
    }
    var now = new Date().toISOString();
    guest.createdAt = now;
    guest.updatedAt = now;
    guests.push(guest);
    writeGuests_(guests);
    return { ok: true, guest: guest, guests: guests, settings: readSettings_() };
  });
}

function updateGuest_(payload) {
  return withLock_(function () {
    var guests = readGuests_();
    var original = slugify_(payload.originalSlug || (payload.guest && payload.guest.slug) || '');
    var index = -1;
    for (var i = 0; i < guests.length; i++) {
      if (guests[i].slug === original) { index = i; break; }
    }
    if (index === -1) throw new Error('Guest not found');

    var guest = normalizeGuestInput_(payload.guest);
    var duplicate = guests.some(function (g, i) { return i !== index && g.slug === guest.slug; });
    if (duplicate) guest.slug = guest.slug + '-' + randomSuffix_();

    guest.createdAt = guests[index].createdAt;
    guest.updatedAt = new Date().toISOString();
    guests[index] = guest;
    writeGuests_(guests);
    return { ok: true, guest: guest, guests: guests, settings: readSettings_() };
  });
}

function deleteGuest_(payload) {
  return withLock_(function () {
    var slug = slugify_(payload.slug || '');
    if (!slug) throw new Error('Missing guest slug');
    var guests = readGuests_().filter(function (g) { return g.slug !== slug; });
    writeGuests_(guests);
    return { ok: true, guests: guests, settings: readSettings_() };
  });
}

function replaceGuests_(payload) {
  return withLock_(function () {
    var list = Array.isArray(payload.guests) ? payload.guests : [];
    var seen = {};
    var now = new Date().toISOString();
    var guests = list.map(function (raw) {
      var guest = normalizeGuestInput_(raw);
      var base = guest.slug;
      while (seen[guest.slug]) guest.slug = base + '-' + randomSuffix_();
      seen[guest.slug] = true;
      guest.createdAt = raw.createdAt || now;
      guest.updatedAt = raw.updatedAt || now;
      return guest;
    });
    writeGuests_(guests);
    return { ok: true, guests: guests, settings: readSettings_() };
  });
}

/* ------------------------- Settings -------------------------- */

function readSettings_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SETTINGS_SHEET);
  var out = {};
  if (!sheet) return out;
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    var key = String(values[i][0] || '').trim();
    if (key) out[key] = values[i][1];
  }
  return out;
}

function writeSetting_(key, value) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) return;
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function saveSettings_(payload) {
  var settings = payload.settings || {};
  Object.keys(settings).forEach(function (key) {
    writeSetting_(key, settings[key]);
  });
  return { ok: true, settings: readSettings_() };
}

/* ------------------------- Web API --------------------------- */

function doGet(e) {
  var params = (e && e.parameter) || {};
  var result;
  try {
    result = handleGet_(params);
  } catch (err) {
    result = { ok: false, error: String(err && err.message ? err.message : err) };
  }
  return respond_(result, params.callback);
}

function handleGet_(params) {
  var action = String(params.action || 'guest');

  if (action === 'health') {
    return { ok: true, service: 'dm-wedding-api', time: new Date().toISOString() };
  }

  if (action === 'guest') {
    var slug = String(params.slug || '').trim();
    if (!slug) return { ok: false, error: 'missing_slug' };
    var guests = readGuests_();
    for (var i = 0; i < guests.length; i++) {
      if (guests[i].slug.toLowerCase() === slug.toLowerCase()) {
        return {
          ok: true,
          guest: {
            slug: guests[i].slug,
            salutation: guests[i].salutation,
            name: guests[i].name,
            display: guests[i].display
          }
        };
      }
    }
    return { ok: false, error: 'not_found' };
  }

  return { ok: false, error: 'unknown_action' };
}

function doPost(e) {
  var payload;
  try {
    payload = parsePayload_(e);
  } catch (err) {
    return respond_({ ok: false, error: 'bad_request' });
  }

  var action = String(payload.action || '');

  try {
    if (action === 'login') {
      return respond_(login_(payload));
    }

    var session = getSession_(payload.token);
    if (!session) {
      return respond_({ ok: false, error: 'unauthorized' });
    }

    if (action === 'logout') {
      destroySession_(payload.token);
      return respond_({ ok: true });
    }
    if (action === 'ping') {
      return respond_({ ok: true, username: session.username });
    }
    if (action === 'listGuests') {
      return respond_(listGuests_());
    }
    if (action === 'addGuest') {
      return respond_(addGuest_(payload));
    }
    if (action === 'updateGuest') {
      return respond_(updateGuest_(payload));
    }
    if (action === 'deleteGuest') {
      return respond_(deleteGuest_(payload));
    }
    if (action === 'replaceGuests') {
      return respond_(replaceGuests_(payload));
    }
    if (action === 'getSettings') {
      return respond_({ ok: true, settings: readSettings_() });
    }
    if (action === 'saveSettings') {
      return respond_(saveSettings_(payload));
    }
    if (action === 'changePassword') {
      return respond_(changePassword_(payload));
    }

    return respond_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return respond_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function parsePayload_(e) {
  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }
  return {};
}

/**
 * Reply with JSON. If a valid ?callback=name is supplied, reply as
 * JSONP so the invitation page can read guest names without CORS.
 */
function respond_(obj, callback) {
  var json = JSON.stringify(obj);
  var cb = String(callback || '');
  var safe = /^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(cb);
  if (safe) {
    return ContentService
      .createTextOutput(cb + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
