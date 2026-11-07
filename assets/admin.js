/* =========================================================
   Admin portal — Guest Link Manager
   ---------------------------------------------------------
   NOTE: This passcode is a simple convenience lock only.
   It is NOT real security (the page is static). Never put
   sensitive information here.
   Change the passcode below to your own.
   ========================================================= */

(function () {
  "use strict";

  var ADMIN_PASSCODE = "D&M2026";

  var STORAGE_KEY = "dm_wedding_guests";
  var BASE_KEY = "dm_wedding_base";
  var SESSION_KEY = "dm_admin_ok";
  var COUPLE = { bride: "Dhananjani", groom: "Mahesh" };

  var state = {
    guests: [],
    base: "",
    editingSlug: null
  };

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
    v = v.replace(/\/?(index|admin)\.html?$/i, "");
    if (!/^https?:\/\//i.test(v)) v = "https://" + v;
    if (!v.endsWith("/")) v += "/";
    return v;
  }

  function deriveBase() {
    if (location.protocol === "file:") return "";
    var href = location.href.split("?")[0].split("#")[0];
    href = href.replace(/admin\.html?$/i, "").replace(/index\.html?$/i, "");
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

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.guests));
    } catch (e) { /* storage might be unavailable */ }
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

  /* ---------- Gate ---------- */
  var gate = $("gate");
  var app = $("app");

  function unlock() {
    if (gate) gate.style.display = "none";
    if (app) app.hidden = false;
    initAdmin();
  }

  function bindGate() {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      unlock();
      return;
    }
    var form = $("gateForm");
    var input = $("gatePass");
    var error = $("gateError");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (input.value === ADMIN_PASSCODE) {
        sessionStorage.setItem(SESSION_KEY, "1");
        error.textContent = "";
        unlock();
      } else {
        error.textContent = "Incorrect passcode. Please try again.";
        input.value = "";
        input.focus();
      }
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
        state.guests = state.guests.filter(function (g) { return g.slug !== guest.slug; });
        if (state.editingSlug === guest.slug) resetForm();
        persist();
        render();
        toast("Guest removed");
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

  /* ---------- Data loading ---------- */
  function loadFromServer() {
    return fetch("data/guests.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        var list = data && Array.isArray(data.guests) ? data.guests : [];
        state.guests = normalizeGuests(list);
        persist();
        render();
      })
      .catch(function () {
        render();
      });
  }

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
    a.download = "guests.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast("guests.json downloaded — upload it to data/ in your repo");
  }

  /* ---------- Init ---------- */
  var initialized = false;

  function initAdmin() {
    if (initialized) return;
    initialized = true;

    var savedBase = localStorage.getItem(BASE_KEY);
    state.base = savedBase !== null ? savedBase : deriveBase();
    var baseInput = $("baseUrl");
    if (baseInput) baseInput.value = state.base;

    /* Site base URL */
    $("saveBase").addEventListener("click", function () {
      state.base = normalizeBase(baseInput.value);
      baseInput.value = state.base;
      localStorage.setItem(BASE_KEY, state.base);
      $("baseSaved").textContent = state.base
        ? "Saved. Guest links now start with " + state.base
        : "No site link set yet. Guest links will show only the code (?g=...).";
      render();
      toast("Site link saved");
    });

    /* Guest form bindings */
    $("gSalutation").addEventListener("change", autoFromName);
    $("gName").addEventListener("input", autoFromName);
    $("gDisplay").addEventListener("input", function () { displayTouched = true; });
    $("gSlug").addEventListener("input", function () { slugTouched = true; });
    $("cancelEdit").addEventListener("click", resetForm);

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
      if (!display) {
        toast("Please enter a display name");
        $("gDisplay").focus();
        return;
      }
      if (!slug) {
        toast("Please enter a guest link code");
        $("gSlug").focus();
        return;
      }

      var duplicate = state.guests.some(function (g) {
        return g.slug === slug && g.slug !== state.editingSlug;
      });
      if (duplicate) {
        toast("That link code is already used by another guest");
        $("gSlug").focus();
        return;
      }

      var guest = { slug: slug, salutation: salutation, name: name, display: display, phone: phone };

      if (state.editingSlug) {
        var index = state.guests.findIndex(function (g) { return g.slug === state.editingSlug; });
        if (index > -1) state.guests[index] = guest;
        else state.guests.push(guest);
        toast("Guest updated");
      } else {
        state.guests.push(guest);
        toast("Guest added");
      }

      persist();
      render();
      resetForm();
    });

    /* Toolbar */
    $("reloadBtn").addEventListener("click", function () {
      if (!window.confirm("Reload the guest list from data/guests.json? Any unsaved changes in this browser will be replaced.")) return;
      loadFromServer().then(function () { toast("Guest list reloaded"); });
    });

    $("exportBtn").addEventListener("click", exportGuests);

    $("importInput").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var list = Array.isArray(data) ? data : (data.guests || []);
          state.guests = normalizeGuests(list);
          persist();
          render();
          toast("Imported " + state.guests.length + " guest(s)");
        } catch (err) {
          toast("That file is not valid guest JSON");
        }
        event.target.value = "";
      };
      reader.readAsText(file);
    });

    /* Load guests: prefer this browser's working copy, else the published file */
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      try {
        state.guests = normalizeGuests(JSON.parse(stored));
      } catch (e) {
        state.guests = [];
      }
      render();
    } else {
      loadFromServer();
    }
  }

  bindGate();
})();
