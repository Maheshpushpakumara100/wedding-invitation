/* =========================================================
   Dhananjani & Mahesh — Wedding Invitation
   Interactions: intro, language switch (EN / Sinhala),
   guest personalisation, countdown, calendar file,
   WhatsApp RSVP, scroll reveals, heart rain.
   ========================================================= */

(function () {
  "use strict";

  var WEDDING_ISO = "2026-12-07T08:30:00+05:30";
  var RSVP_WHATSAPP = "94717979436"; // Mahesh — primary RSVP number

  /* ---------- Translations ---------- */
  var I18N = {
    en: {
      bride: "Dhananjani",
      groom: "Mahesh",
      introTogether: "Together with our families",
      openInvite: "Open Invitation",
      tapSeal: "Tap to break the seal",
      heroEyebrow: "The Wedding Celebration of",
      heroDate: "Monday · 07 December 2026",
      heroPlace: "Tranquil Hotel · Naranwala, Waliweriya",
      guestLine: "You are warmly invited to share in our joy.",
      navAria: "Invitation sections",
      navHome: "Home",
      navInvitation: "Invitation",
      navDetails: "Details",
      navVenue: "Venue",
      navRsvp: "RSVP",
      countLabel: "Counting the days",
      countTitle: "We are getting married",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      countNote: "Until Monday, 7 December 2026",
      countToday: "Today is the day — we cannot wait to celebrate with you!",
      togetherParents: "Together with their parents",
      inviteText: "warmly request the honour of your presence<br />to celebrate their wedding on",
      weddingDate: "Monday, 07 December 2026",
      weddingTime: "08.30 AM – 04.00 PM",
      weddingVenue: "Tranquil Hotel<br />Naranwala, Waliweriya",
      poruwa: "Poruwa ceremony at 09.48 AM",
      detailsLabel: "The Celebration",
      detailsTitle: "Order of the day",
      monday: "Monday",
      dateShort: "07 December 2026",
      detail1Text: "The wedding celebration begins at 08.30 AM and continues until 04.00 PM.",
      poruwaTitle: "Poruwa Ceremony",
      detail2Text: "The traditional Poruwa ceremony will be held at 09.48 AM.",
      venueKicker: "The Venue",
      venueName: "Tranquil Hotel",
      detail3Text: "Naranwala, Waliweriya. We look forward to celebrating with you there.",
      addCalendar: "Add to Calendar",
      openMaps: "Open in Maps",
      venueLabel: "Where we celebrate",
      venueTitle: "The Venue",
      venueAddress: "Naranwala, Waliweriya",
      rsvpLabel: "Kindly reply",
      rsvpTitle: "Will you join us?",
      rsvpIntro: "It would mean so much to have you with us. Please let us know if you can join the celebration.",
      yourName: "Your name",
      fullName: "Full name",
      willAttend: "Will you attend?",
      joyfully: "Joyfully accepts",
      regretfully: "Regretfully declines",
      numGuests: "Number of guests",
      sendReply: "Send reply on WhatsApp",
      formNote: "Your reply will open in WhatsApp so you can send it directly to us.",
      rsvpContact: "RSVP & Contact",
      personMahesh: "Mahesh",
      personDhananjani: "Dhananjani",
      waMahesh: "WhatsApp Mahesh",
      waDhananjani: "WhatsApp Dhananjani",
      saveDate: "Save the date",
      sealed: "Sealed with love.",
      scrollAria: "Scroll to countdown",
      langAria: "Language",
      musicMute: "Mute music",
      musicPlay: "Play music",
      pageTitle: "Dhananjani & Mahesh · Wedding Invitation"
    },
    si: {
      bride: "ධනංජනී",
      groom: "මහේෂ්",
      introTogether: "අපගේ පවුල් සමඟ",
      openInvite: "ආරාධනය විවෘත කරන්න",
      tapSeal: "මුද්‍රාව බිඳීමට තට්ටු කරන්න",
      heroEyebrow: "විවාහ මංගලෝත්සවය",
      heroDate: "සඳුදා · 2026 දෙසැම්බර් 07",
      heroPlace: "ට්‍රැන්ක්විල් හෝටලය · නාරන්වල, වලිවේරිය",
      guestLine: "අපගේ සතුටට ඔබත් සහභාගී වන ලෙස ආදරයෙන් ආරාධනා කරමු.",
      navAria: "ආරාධනා කොටස්",
      navHome: "මුල් පිටුව",
      navInvitation: "ආරාධනය",
      navDetails: "විස්තර",
      navVenue: "ස්ථානය",
      navRsvp: "පිළිතුරු",
      countLabel: "දින ගණන් කරමින්",
      countTitle: "අපි විවාහ වෙමු",
      days: "දින",
      hours: "පැය",
      minutes: "මිනිත්තු",
      seconds: "තත්පර",
      countNote: "2026 දෙසැම්බර් 07 සඳුදා දක්වා",
      countToday: "අද එම දිනයයි — ඔබ සමඟ සමරන්න අපි බලා සිටිමු!",
      togetherParents: "ඔවුන්ගේ දෙමාපියන් සමඟ",
      inviteText: "ඔබගේ සහභාගීත්වය ඇතිව අපගේ විවාහ මංගල්‍යය<br />සමරන ලෙස ඉතා ගෞරවයෙන් ඉල්ලා සිටිමු",
      weddingDate: "සඳුදා, 2026 දෙසැම්බර් 07",
      weddingTime: "පෙ.ව. 08.30 – ප.ව. 04.00",
      weddingVenue: "ට්‍රැන්ක්විල් හෝටලය<br />නාරන්වල, වලිවේරිය",
      poruwa: "පොරුවා මංගල්‍යය පෙ.ව. 09.48 ට",
      detailsLabel: "මංගලෝත්සවය",
      detailsTitle: "දින වැඩසටහන",
      monday: "සඳුදා",
      dateShort: "2026 දෙසැම්බර් 07",
      detail1Text: "විවාහ මංගලෝත්සවය පෙ.ව. 08.30 ට ආරම්භ වී ප.ව. 04.00 දක්වා පැවැත්වේ.",
      poruwaTitle: "පොරුවා මංගල්‍යය",
      detail2Text: "සාම්ප්‍රදායික පොරුවා මංගල්‍යය පෙ.ව. 09.48 ට පැවැත්වේ.",
      venueKicker: "ස්ථානය",
      venueName: "ට්‍රැන්ක්විල් හෝටලය",
      detail3Text: "නාරන්වල, වලිවේරිය. ඔබ සමඟ එහිදී සමරන්න අපි බලා සිටිමු.",
      addCalendar: "දින දර්ශනයට එක් කරන්න",
      openMaps: "සිතියමේ විවෘත කරන්න",
      venueLabel: "අපි සමරන ස්ථානය",
      venueTitle: "ස්ථානය",
      venueAddress: "නාරන්වල, වලිවේරිය",
      rsvpLabel: "කරුණාකර පිළිතුරු දෙන්න",
      rsvpTitle: "ඔබ අප හා එක්වේද?",
      rsvpIntro: "ඔබ අප සමඟ සිටීම අපට ඉතා වැදගත්. ඔබට මංගලෝත්සවයට සහභාගී විය හැකිදැයි කරුණාකර අපට දන්වන්න.",
      yourName: "ඔබගේ නම",
      fullName: "සම්පූර්ණ නම",
      willAttend: "ඔබ සහභාගී වේද?",
      joyfully: "සතුටින් සහභාගී වෙමි",
      regretfully: "කණගාටුවෙන් වැළකී සිටිමි",
      numGuests: "අමුත්තන් ගණන",
      sendReply: "WhatsApp හරහා පිළිතුරු යවන්න",
      formNote: "ඔබගේ පිළිතුර WhatsApp හි විවෘත වන අතර, එය අපට සෘජුවම යැවිය හැක.",
      rsvpContact: "පිළිතුරු සහ සම්බන්ධතා",
      personMahesh: "මහේෂ්",
      personDhananjani: "ධනංජනී",
      waMahesh: "WhatsApp මහේෂ්",
      waDhananjani: "WhatsApp ධනංජනී",
      saveDate: "දිනය මතක තබාගන්න",
      sealed: "ආදරයෙන් මුද්‍රා තබන ලදී.",
      scrollAria: "ගණන් කිරීමට පහළට අනුචලනය කරන්න",
      langAria: "භාෂාව",
      musicMute: "සංගීතය නිහඬ කරන්න",
      musicPlay: "සංගීතය වාදනය කරන්න",
      pageTitle: "ධනංජනී සහ මහේෂ් · විවාහ ආරාධනය"
    }
  };

  var currentLang = "en";
  try {
    var savedLang = localStorage.getItem("dm_lang");
    if (savedLang === "si" || savedLang === "en") {
      currentLang = savedLang;
    } else if ((navigator.language || "").toLowerCase().indexOf("si") === 0) {
      currentLang = "si";
    }
  } catch (e) { /* ignore */ }

  function t(key) {
    var table = I18N[currentLang] || I18N.en;
    if (table[key] != null) return table[key];
    if (I18N.en[key] != null) return I18N.en[key];
    return key;
  }

  /* ---------- Elements ---------- */
  var intro = document.getElementById("intro");
  var invite = document.getElementById("invite");
  var openBtn = document.getElementById("openInvite");
  var greetingEl = document.getElementById("guestGreeting");
  var introGreetingEl = document.getElementById("introGuest");
  var nameInput = document.getElementById("rsvpName");
  var daysEl = document.getElementById("days");
  var hoursEl = document.getElementById("hours");
  var minutesEl = document.getElementById("minutes");
  var secondsEl = document.getElementById("seconds");
  var noteEl = document.getElementById("countdownNote");
  var form = document.getElementById("rsvpForm");
  var countEl = document.getElementById("rsvpCount");
  var calBtn = document.getElementById("addCalendar");

  var guestDisplay = "";

  /* ---------- Greeting ---------- */
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function defaultGuestLabel() {
    return currentLang === "si" ? "අමුත්තා" : "Guest";
  }

  function refreshGreeting() {
    var display = guestDisplay || defaultGuestLabel();
    var prefix = currentLang === "si" ? "ආදරණීය " : "Dear ";
    var html = prefix + '<span class="guest-name">' + escapeHtml(display) + "</span>,";
    if (greetingEl) greetingEl.innerHTML = html;
    if (introGreetingEl) introGreetingEl.innerHTML = html;
  }

  function applyGuestName(display) {
    if (!display) return;
    guestDisplay = display;
    refreshGreeting();
    if (nameInput) nameInput.value = display;
  }

  /* ---------- Language ---------- */
  function waHello(name) {
    return currentLang === "si"
      ? "ආයුබෝවන් " + name + ", ඔබගේ විවාහ ආරාධනය මට ලැබුණි."
      : "Hello " + name + ", I have received your wedding invitation.";
  }

  function applyLanguage(lang) {
    currentLang = lang === "si" ? "si" : "en";
    document.documentElement.lang = currentLang;
    try { localStorage.setItem("dm_lang", currentLang); } catch (e) { /* ignore */ }

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });

    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === currentLang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var waLinks = document.querySelectorAll(".contact-wa a");
    if (waLinks.length >= 2) {
      waLinks[0].href = "https://wa.me/94717979436?text=" + encodeURIComponent(waHello(t("personMahesh")));
      waLinks[1].href = "https://wa.me/94715534712?text=" + encodeURIComponent(waHello(t("personDhananjani")));
    }

    document.title = t("pageTitle");
    if (typeof setMusicState === "function") setMusicState(musicPlaying);
    refreshGreeting();
    refreshCountdownNote();
  }

  var langSwitch = document.getElementById("langSwitch");
  if (langSwitch) {
    langSwitch.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-lang]");
      if (!btn) return;
      applyLanguage(btn.getAttribute("data-lang"));
    });
  }

  /* ---------- Intro / envelope ---------- */
  var envelopeScene = document.getElementById("envelopeScene");
  var introVideo = document.getElementById("introVideo");
  var introVideoEl = document.getElementById("introVideoEl");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var videoTimer = 0;

  function startMusicSafe() {
    try {
      if (localStorage.getItem("dm_music") !== "off") playMusic();
    } catch (e) {
      playMusic();
    }
  }

  function stopIntroVideo() {
    if (videoTimer) {
      window.clearTimeout(videoTimer);
      videoTimer = 0;
    }
    if (introVideoEl) {
      try { introVideoEl.pause(); } catch (e) { /* ignore */ }
    }
  }

  function revealInvitation() {
    stopIntroVideo();
    if (introVideo) {
      introVideo.classList.remove("is-active");
      introVideo.setAttribute("aria-hidden", "true");
    }
    if (invite) {
      invite.classList.add("is-visible");
      invite.setAttribute("aria-hidden", "false");
    }
    intro.classList.add("is-open");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      intro.style.display = "none";
      if (envelopeScene) {
        envelopeScene.classList.remove("is-active", "is-open-env", "is-letter-out");
      }
    }, 950);
  }

  function playIntroVideo() {
    introVideo.classList.add("is-active");
    introVideo.setAttribute("aria-hidden", "false");

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      startMusicSafe();
      revealInvitation();
    }

    introVideoEl.addEventListener("ended", finish, { once: true });
    introVideoEl.addEventListener("error", finish, { once: true });

    var duration = isFinite(introVideoEl.duration) && introVideoEl.duration > 0 ? introVideoEl.duration : 30;
    videoTimer = window.setTimeout(finish, (duration + 3) * 1000);

    var attempt = introVideoEl.play();
    if (attempt && typeof attempt.then === "function") {
      attempt.catch(function () {
        introVideoEl.muted = true;
        var muted = introVideoEl.play();
        if (muted && typeof muted.then === "function") muted.catch(finish);
      });
    }
  }

  function openInvitation(immediate) {
    if (!intro || intro.classList.contains("is-open") || intro.classList.contains("is-opening")) return;
    intro.classList.add("is-opening");
    if (openBtn) openBtn.setAttribute("disabled", "disabled");

    if (immediate === true || reduceMotion) {
      startMusicSafe();
      revealInvitation();
      return;
    }

    if (introVideo && introVideoEl) {
      playIntroVideo();
      return;
    }

    startMusicSafe();

    if (!envelopeScene) {
      revealInvitation();
      return;
    }

    envelopeScene.classList.add("is-active");

    window.setTimeout(function () {
      envelopeScene.classList.add("is-open-env");
    }, 420);

    window.setTimeout(function () {
      envelopeScene.classList.add("is-letter-out");
    }, 1000);

    window.setTimeout(revealInvitation, 1950);
  }

  if (openBtn) {
    openBtn.addEventListener("click", function () {
      openInvitation(false);
    });
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get("skip") === "1" || window.location.hash === "#open") {
    openInvitation(true);
  }

  /* ---------- Guest personalisation ---------- */
  var slug = (params.get("g") || "").trim();
  var directName = (params.get("to") || "").trim();

  if (directName) {
    applyGuestName(directName);
  }

  if (slug) {
    fetch("data/guests.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.guests)) return;
        var found = data.guests.filter(function (guest) {
          return String(guest.slug).toLowerCase() === slug.toLowerCase();
        })[0];
        if (found) {
          applyGuestName(found.display || [found.salutation, found.name].filter(Boolean).join(" "));
        }
      })
      .catch(function () {
        /* Opened from file:// or guests.json missing — silently fall back */
      });
  }

  /* ---------- Countdown ---------- */
  var target = new Date(WEDDING_ISO).getTime();

  function pad(n) { return String(n).padStart(2, "0"); }

  function refreshCountdownNote() {
    if (!noteEl) return;
    var ended = (target - Date.now()) <= 0;
    noteEl.textContent = ended ? t("countToday") : t("countNote");
  }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      if (daysEl) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
      }
      refreshCountdownNote();
      return;
    }
    var sec = Math.floor(diff / 1000);
    var d = Math.floor(sec / 86400);
    var h = Math.floor((sec % 86400) / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    if (daysEl) {
      daysEl.textContent = pad(d);
      hoursEl.textContent = pad(h);
      minutesEl.textContent = pad(m);
      secondsEl.textContent = pad(s);
    }
    refreshCountdownNote();
    window.setTimeout(tick, 1000);
  }
  tick();

  /* ---------- Add to calendar (.ics) ---------- */
  function buildIcs() {
    var stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Dhananjani and Mahesh//Wedding//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Colombo",
      "BEGIN:STANDARD",
      "DTSTART:19700101T000000",
      "TZOFFSETFROM:+0530",
      "TZOFFSETTO:+0530",
      "TZNAME:+0530",
      "END:STANDARD",
      "END:VTIMEZONE",
      "BEGIN:VEVENT",
      "UID:dhananjani-mahesh-wedding-20261207@invitation",
      "DTSTAMP:" + stamp,
      "DTSTART;TZID=Asia/Colombo:20261207T083000",
      "DTEND;TZID=Asia/Colombo:20261207T160000",
      "SUMMARY:Wedding of Dhananjani & Mahesh",
      "LOCATION:Tranquil Hotel\\, Naranwala\\, Waliweriya",
      "DESCRIPTION:Together with their parents\\, Dhananjani and Mahesh warmly request the honour of your presence. Poruwa ceremony at 09.48 AM. RSVP: Mahesh 071 79 79 436 / Dhananjani 071 55 34 712.",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  if (calBtn) {
    calBtn.addEventListener("click", function () {
      var blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "dhananjani-mahesh-wedding.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    });
  }

  /* ---------- RSVP via WhatsApp ---------- */
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = (nameInput && nameInput.value.trim()) || guestDisplay || (currentLang === "si" ? "අමුත්තෙක්" : "A guest");
      var attendInput = form.querySelector('input[name="attend"]:checked');
      var attend = attendInput ? attendInput.value : "joyfully accept";
      var count = countEl ? countEl.value : "1";
      var message;

      if (currentLang === "si") {
        message =
          "ආයුබෝවන්, මම " + name + ". " +
          "ධනංජනී සහ මහේෂ් ගේ විවාහ මංගල්‍යයට මගේ ආරාධනය " +
          (attend === "joyfully accept" ? "සතුටින් පිළිගනිමි" : "කණගාටුවෙන් ප්‍රතික්ෂේප කරමි") +
          ". 2026 දෙසැම්බර් 07 සඳුදා, ට්‍රැන්ක්විල් හෝටලය, නාරන්වල, වලිවේරිය. " +
          "අමුත්තන් ගණන: " + count + ".";
      } else {
        message =
          "Hello, this is " + name + ". " +
          "I " + attend + " the invitation to the wedding of Dhananjani & Mahesh " +
          "on Monday, 07 December 2026 at Tranquil Hotel, Naranwala, Waliweriya. " +
          "Number of guests: " + count + ".";
      }

      var url = "https://wa.me/" + RSVP_WHATSAPP + "?text=" + encodeURIComponent(message);
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(".section, .footer, .hero-content");
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Heart rain ---------- */
  (function heartRain() {
    var layer = document.getElementById("heartRain");
    if (!layer) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var colors = [
      "rgba(214, 151, 160, 0.55)",
      "rgba(212, 180, 131, 0.55)",
      "rgba(196, 150, 160, 0.45)",
      "rgba(230, 190, 196, 0.50)"
    ];
    var count = window.innerWidth < 640 ? 14 : 24;
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var heart = document.createElement("span");
      heart.className = "heart";
      var size = 8 + Math.random() * 12;
      var duration = 10 + Math.random() * 9;
      heart.style.setProperty("--s", size.toFixed(1) + "px");
      heart.style.setProperty("--c", colors[i % colors.length]);
      heart.style.setProperty("--d", duration.toFixed(1) + "s");
      heart.style.setProperty("--delay", (-Math.random() * duration).toFixed(1) + "s");
      heart.style.setProperty("--sway", (Math.random() * 90 - 45).toFixed(0) + "px");
      heart.style.setProperty("--o", (0.35 + Math.random() * 0.35).toFixed(2));
      heart.style.left = (Math.random() * 100).toFixed(1) + "%";
      fragment.appendChild(heart);
    }

    layer.appendChild(fragment);
  })();

  /* ---------- Background music ---------- */
  var music = document.getElementById("bgMusic");
  var musicBtn = document.getElementById("musicToggle");
  var musicPlaying = false;

  function setMusicState(playing) {
    musicPlaying = playing;
    if (!musicBtn) return;
    musicBtn.classList.toggle("is-muted", !playing);
    musicBtn.classList.toggle("is-playing", playing);
    musicBtn.setAttribute("aria-pressed", playing ? "false" : "true");
    musicBtn.setAttribute("aria-label", playing ? t("musicMute") : t("musicPlay"));
    musicBtn.setAttribute("title", playing ? t("musicMute") : t("musicPlay"));
  }

  function playMusic() {
    if (!music) return;
    music.volume = 0.55;
    var attempt = music.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () { setMusicState(false); });
    }
  }

  if (music) {
    music.addEventListener("play", function () { setMusicState(true); });
    music.addEventListener("pause", function () { setMusicState(false); });
  }

  if (musicBtn) {
    musicBtn.addEventListener("click", function () {
      if (!music) return;
      if (music.paused) {
        try { localStorage.setItem("dm_music", "on"); } catch (e) { /* ignore */ }
        playMusic();
      } else {
        music.pause();
        try { localStorage.setItem("dm_music", "off"); } catch (e) { /* ignore */ }
      }
    });
  }

  /* ---------- Initialise language ---------- */
  applyLanguage(currentLang);
})();
