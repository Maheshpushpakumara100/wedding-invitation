/* =========================================================
   Admin portal — Guest Link Manager
   ---------------------------------------------------------
   Talks to the Google Apps Script backend in apps-script/Code.gs.
   Sign in with the username + password configured there, then
   add / edit / delete guests. Changes are saved to Google Sheets
   and the live invitation reads them immediately.
   ========================================================= */

(function () {
  "use strict";

  var CONFIG = window.DM_CONFIG || {};
  var API_URL = String(CONFIG.API_URL || "").trim();

  var ROLE = String(window.DM_ADMIN_ROLE || "groom").toLowerCase() === "bride" ? "bride" : "groom";
  var TOKEN_KEY = "dm_admin_token_" + ROLE;
  var USER_KEY = "dm_admin_user_" + ROLE;
  var BASE_KEY = "dm_wedding_base";
  var COUPLE = { bride: "Dhananjani", groom: "Mahesh" };

  var state = {
    guests: [],
    base: "",
    editingSlug: null,
    username: ""
  };

  var token = "";
  try { token = sessionStorage.getItem(TOKEN_KEY) || ""; } catch (e) { token = ""; }

  var currentSuffix = randomSuffix();
  var displayTouched = false;
  var slugTouched = false;

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function randomSuffix() {
    return Math.random().toString(36).slice(2, 6);
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function buildDisplay(salutation, name) {
    name = (name || "").trim();
    salutation = (salutation || "").trim();
    if (!name) return salutation;
    if (!salutation) return name;
    if (salutation === "Family of") return "Family of " + name;
    return salutation + " " + name;
  }

  function normalizeBase(value) {
    var v = String(value || "").trim();
    if (!v) return "";
    v = v.split("?")[0].split("#")[0];
    v = v.replace(/\/?(index|admin[^\/]*)\.html?$/i, "");
    if (!/^https?:\/\//i.test(v)) v = "https://" + v;
    if (!v.endsWith("/")) v += "/";
    return v;
  }

  function deriveBase() {
    if (location.protocol === "file:") return "";
    var href = location.href.split("?")[0].split("#")[0];
    href = href.replace(/admin[^\/]*\.html?$/i, "").replace(/index\.html?$/i, "");
    if (!href.endsWith("/")) href += "/";
    return href;
  }

  function buildLink(slug) {
    var code = "?g=" + encodeURIComponent(slug);
    return state.base ? state.base + code : code;
  }

  function waNumber(phone) {
    var d = String(phone || "").replace(/\D/g, "");
    if (!d) return "";
    if (d.length === 10 && d.charAt(0) === "0") d = "94" + d.slice(1);
    if (d.length === 9) d = "94" + d;
    return d;
  }

  function shareLink(guest) {
    var link = buildLink(guest.slug);
    var text =
      "Dear " + guest.display + ",\n\n" +
      "You are warmly invited to the wedding of Dhananjani & Mahesh.\n" +
      "Monday, 07 December 2026 · Tranquil Hotel, Naranwala, Waliweriya.\n\n" +
      "View your personal invitation:\n" + link;
    var num = waNumber(guest.phone);
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(text);
  }

  function toast(message) {
    var el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
      } catch (err) {
        reject(err);
      }
      document.body.removeChild(ta);
    });
  }

  function normalizeGuests(list) {
    var seen = {};
    return (Array.isArray(list) ? list : []).map(function (g) {
      var slug = slugify(g.slug) || slugify(g.name) || "guest-" + randomSuffix();
      while (seen[slug]) slug += "-" + randomSuffix();
      seen[slug] = true;
      var salutation = String(g.salutation || "").trim();
      var name = String(g.name || "").trim();
      var display = String(g.display || "").trim() || buildDisplay(salutation, name) || "Guest";
      return {
        slug: slug,
        salutation: salutation,
        name: name,
        display: display,
        phone: String(g.phone || "").trim()
      };
    });
  }

  /* ---------- API ---------- */
  function errorText(code) {
    switch (code) {
      case "unauthorized": return "Your session expired. Please sign in again.";
      case "invalid_credentials": return "Incorrect username or password.";
      case "not_configured": return "The backend is not set up. Run setup() in Apps Script.";
      case "bad_request": return "The request was not valid.";
      case "unknown_action": return "The backend does not support that action.";
      case "missing_slug": return "Missing guest code.";
      case "not_found": return "Guest not found.";
      default: return code ? String(code) : "Something went wrong.";
    }
  }

  function apiCall(action, data) {
    if (!API_URL) {
      return Promise.reject(new Error("API URL is not configured. Add it in assets/config.js."));
    }
    var payload = { action: action, token: token };
    if (data) {
      Object.keys(data).forEach(function (key) { payload[key] = data[key]; });
    }

    return fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    }).then(function (res) {
      if (!res.ok) throw new Error("Server error (" + res.status + ").");
      return res.text().then(function (text) {
        var json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error('Unexpected response. Make sure the Web App is deployed with access "Anyone".');
        }
        if (!json.ok) {
          var err = new Error(errorText(json.error));
          err.code = json.error || "error";
          throw err;
        }
        return json;
      });
    });
  }

  function handleError(err) {
    if (err && err.code === "unauthorized") {
      clearSession();
      showGate();
      toast("Session expired. Please sign in again.");
      return;
    }
    toast(err && err.message ? err.message : "Something went wrong.");
  }

  /* ---------- Session ---------- */
  function saveSession(newToken, username) {
    token = newToken || "";
    state.username = username || "";
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, state.username);
    } catch (e) { /* ignore */ }
  }

  function clearSession() {
    token = "";
    state.username = "";
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (e) { /* ignore */ }
  }

  function showGate() {
    var gate = $("gate");
    var app = $("app");
    if (app) app.hidden = true;
    if (gate) gate.style.display = "";
    var user = $("gateUser");
    if (user) user.focus();
  }

  function unlock() {
    var gate = $("gate");
    var app = $("app");
    if (gate) gate.style.display = "none";
    if (app) app.hidden = false;
    var userEl = $("adminUser");
    if (userEl) userEl.textContent = state.username || "admin";
  }

  /* ---------- State ---------- */
  function applyState(guests, settings) {
    state.guests = normalizeGuests(guests || []);

    var savedBase = "";
    try { savedBase = localStorage.getItem(BASE_KEY) || ""; } catch (e) { savedBase = ""; }
    var serverBase = settings && settings.siteBase ? String(settings.siteBase) : "";
    state.base = normalizeBase(serverBase || savedBase || CONFIG.SITE_BASE || deriveBase());

    var baseInput = $("baseUrl");
    if (baseInput) baseInput.value = state.base;
    updateBaseHint();
    render();
  }

  function updateBaseHint() {
    var hint = $("baseSaved");
    if (!hint) return;
    hint.textContent = state.base
      ? "Guest links start with " + state.base
      : "No site link set yet. Guest links will show only the code (?g=...).";
  }

  /* ---------- Gate ---------- */
  function setGateBusy(busy) {
    var btn = $("gateSubmit");
    if (btn) {
      btn.disabled = busy;
      btn.textContent = busy ? "Signing in…" : "Sign in";
    }
  }

  function bindGate() {
    var form = $("gateForm");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var errorEl = $("gateError");
      var user = ($("gateUser") && $("gateUser").value || "").trim();
      var pass = $("gatePass") && $("gatePass").value || "";

      if (!API_URL) {
        if (errorEl) errorEl.textContent = "Backend not configured: add API_URL in assets/config.js";
        return;
      }
      if (!user || !pass) {
        if (errorEl) errorEl.textContent = "Enter your username and password.";
        return;
      }

      if (errorEl) errorEl.textContent = "";
      setGateBusy(true);

      apiCall("login", { username: user, password: pass })
        .then(function (data) {
          saveSession(data.token, data.username);
          applyState(data.guests, data.settings);
          unlock();
        })
        .catch(function (err) {
          if (errorEl) errorEl.textContent = err && err.message ? err.message : "Could not sign in.";
          var passEl = $("gatePass");
          if (passEl) { passEl.value = ""; passEl.focus(); }
        })
        .then(function () { setGateBusy(false); });
    });
  }

  /* ---------- Form ---------- */
  function resetForm() {
    $("gSalutation").value = "";
    $("gName").value = "";
    $("gDisplay").value = "";
    $("gPhone").value = "";
    $("gSlug").value = "";
    displayTouched = false;
    slugTouched = false;
    currentSuffix = randomSuffix();
    state.editingSlug = null;
    $("formTitle").textContent = "Add a guest";
    $("saveGuest").textContent = "Add guest";
    $("cancelEdit").hidden = true;
  }

  function autoFromName() {
    var sal = $("gSalutation").value;
    var name = $("gName").value.trim();
    if (!displayTouched) $("gDisplay").value = buildDisplay(sal, name);
    if (!slugTouched) $("gSlug").value = name ? slugify(name) + "-" + currentSuffix : "";
  }

  function startEdit(guest) {
    state.editingSlug = guest.slug;
    $("gSalutation").value = guest.salutation || "";
    $("gName").value = guest.name || "";
    $("gDisplay").value = guest.display || "";
    $("gPhone").value = guest.phone || "";
    $("gSlug").value = guest.slug || "";
    displayTouched = true;
    slugTouched = true;
    $("formTitle").textContent = "Edit guest";
    $("saveGuest").textContent = "Save changes";
    $("cancelEdit").hidden = false;
    $("gName").focus();
  }

  /* ---------- Rendering ---------- */
  function render() {
    var rows = $("guestRows");
    var count = $("guestCount");
    var empty = $("emptyMsg");
    if (!rows) return;

    rows.textContent = "";
    if (count) count.textContent = state.guests.length;
    if (empty) empty.hidden = state.guests.length > 0;

    state.guests.forEach(function (guest) {
      var tr = document.createElement("tr");

      var tdName = document.createElement("td");
      var name = document.createElement("span");
      name.className = "guest-name";
      name.textContent = guest.display;
      var slug = document.createElement("span");
      slug.className = "guest-slug";
      slug.textContent = "?g=" + guest.slug;
      tdName.appendChild(name);
      tdName.appendChild(slug);

      var tdLink = document.createElement("td");
      var link = document.createElement("span");
      link.className = "guest-link";
      link.textContent = buildLink(guest.slug);
      link.title = buildLink(guest.slug);
      tdLink.appendChild(link);

      var tdActions = document.createElement("td");
      var actions = document.createElement("div");
      actions.className = "actions";

      actions.appendChild(miniButton("Copy", "", function () {
        copyText(buildLink(guest.slug))
          .then(function () { toast("Link copied for " + guest.display); })
          .catch(function () { toast("Could not copy the link"); });
      }));

      actions.appendChild(miniButton("WhatsApp", "", function () {
        window.open(shareLink(guest), "_blank", "noopener");
      }));

      actions.appendChild(miniButton("Edit", "", function () {
        startEdit(guest);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }));

      actions.appendChild(miniButton("Delete", "danger", function () {
        if (!window.confirm("Remove " + guest.display + " from the guest list?")) return;
        apiCall("deleteGuest", { slug: guest.slug })
          .then(function (res) {
            state.guests = normalizeGuests(res.guests);
            if (state.editingSlug === guest.slug) resetForm();
            render();
            toast("Guest removed");
          })
          .catch(handleError);
      }));

      tdActions.appendChild(actions);

      tr.appendChild(tdName);
      tr.appendChild(tdLink);
      tr.appendChild(tdActions);
      rows.appendChild(tr);
    });
  }

  function miniButton(label, extraClass, handler) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini-btn" + (extraClass ? " " + extraClass : "");
    btn.textContent = label;
    btn.addEventListener("click", handler);
    return btn;
  }

  /* ---------- Export / import ---------- */
  function exportGuests() {
    var payload = {
      couple: COUPLE,
      guests: state.guests.map(function (g) {
        return {
          slug: g.slug,
          salutation: g.salutation,
          name: g.name,
          display: g.display,
          phone: g.phone || ""
        };
      })
    };
    var blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = ROLE === "bride" ? "bride-guests.json" : "guests.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast(a.download + " downloaded");
  }

  /* ---------- App bindings ---------- */
  function bindApp() {
    var saveBase = $("saveBase");
    if (saveBase) {
      saveBase.addEventListener("click", function () {
        var baseInput = $("baseUrl");
        state.base = normalizeBase(baseInput.value);
        baseInput.value = state.base;
        try { localStorage.setItem(BASE_KEY, state.base); } catch (e) { /* ignore */ }
        updateBaseHint();
        render();
        apiCall("saveSettings", { settings: { siteBase: state.base } })
          .then(function () { toast("Site link saved"); })
          .catch(function (err) { toast("Saved locally only: " + (err.message || "could not reach server")); });
      });
    }

    if ($("gSalutation")) {
      $("gSalutation").addEventListener("change", autoFromName);
      $("gName").addEventListener("input", autoFromName);
      $("gDisplay").addEventListener("input", function () { displayTouched = true; });
      $("gSlug").addEventListener("input", function () { slugTouched = true; });
      $("cancelEdit").addEventListener("click", resetForm);
    }

    if ($("guestForm")) {
      $("guestForm").addEventListener("submit", function (event) {
        event.preventDefault();

        var salutation = $("gSalutation").value.trim();
        var name = $("gName").value.trim();
        var display = $("gDisplay").value.trim() || buildDisplay(salutation, name);
        var phone = $("gPhone").value.trim();
        var slug = slugify($("gSlug").value) || (name ? slugify(name) + "-" + randomSuffix() : "");

        if (!name && !display) {
          toast("Please enter a guest name");
          $("gName").focus();
          return;
        }
        if (!slug) {
          toast("Please enter a guest link code");
          $("gSlug").focus();
          return;
        }

        var guest = { slug: slug, salutation: salutation, name: name, display: display, phone: phone };
        var editing = state.editingSlug;
        var action = editing ? "updateGuest" : "addGuest";
        var data = editing ? { originalSlug: editing, guest: guest } : { guest: guest };

        var saveBtn = $("saveGuest");
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving…";

        apiCall(action, data)
          .then(function (res) {
            state.guests = normalizeGuests(res.guests);
            render();
            resetForm();
            toast(editing ? "Guest updated" : "Guest added");
          })
          .catch(handleError)
          .then(function () {
            saveBtn.disabled = false;
            saveBtn.textContent = state.editingSlug ? "Save changes" : "Add guest";
          });
      });
    }

    if ($("reloadBtn")) {
      $("reloadBtn").addEventListener("click", function () {
        apiCall("listGuests")
          .then(function (res) {
            state.guests = normalizeGuests(res.guests);
            render();
            toast("Guest list refreshed");
          })
          .catch(handleError);
      });
    }

    if ($("exportBtn")) $("exportBtn").addEventListener("click", exportGuests);

    if ($("importInput")) {
      $("importInput").addEventListener("change", function (event) {
        var file = event.target.files && event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var parsed = JSON.parse(reader.result);
            var list = Array.isArray(parsed) ? parsed : (parsed.guests || []);
            apiCall("replaceGuests", { guests: list })
              .then(function (res) {
                state.guests = normalizeGuests(res.guests);
                render();
                toast("Imported " + state.guests.length + " guest(s)");
              })
              .catch(handleError);
          } catch (err) {
            toast("That file is not valid guest JSON");
          }
          event.target.value = "";
        };
        reader.readAsText(file);
      });
    }

    if ($("logoutBtn")) {
      $("logoutBtn").addEventListener("click", function () {
        apiCall("logout")
          .catch(function () { /* ignore */ })
          .then(function () {
            clearSession();
            showGate();
            toast("Signed out");
          });
      });
    }

    if ($("pwForm")) {
      $("pwForm").addEventListener("submit", function (event) {
        event.preventDefault();
        var current = $("currentPw").value;
        var next = $("newPw").value;
        var confirm = $("confirmPw").value;

        if (next.length < 6) { toast("New password must be at least 6 characters"); return; }
        if (next !== confirm) { toast("New passwords do not match"); return; }

        apiCall("changePassword", { currentPassword: current, newPassword: next })
          .then(function () {
            $("pwForm").reset();
            toast("Password updated");
          })
          .catch(handleError);
      });
    }
  }

  /* ---------- Boot ---------- */
  function boot() {
    bindGate();
    bindApp();

    if (!API_URL) {
      var errorEl = $("gateError");
      if (errorEl) {
        errorEl.textContent = "Backend not configured: add your Apps Script /exec URL in assets/config.js";
      }
      return;
    }

    if (!token) return;

    apiCall("ping")
      .then(function (data) {
        state.username = data.username || "";
        return apiCall("listGuests");
      })
      .then(function (res) {
        state.username = state.username || "admin";
        applyState(res.guests, res.settings);
        unlock();
      })
      .catch(function () {
        clearSession();
        showGate();
      });
  }

  boot();
})();
