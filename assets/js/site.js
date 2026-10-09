/* =============================================================
   Gregorio Orlando - portfolio
   Progressive enhancement only. Every page is fully readable
   and navigable with JavaScript disabled.
   ============================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Mobile navigation ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    }

    toggle.addEventListener("click", function () {
      setOpen(nav.getAttribute("data-open") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia("(min-width: 881px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });

    setOpen(false);
  }

  /* ---------- 2. Theme -----------------------------------------
     The inline script in <head> already resolved a theme onto
     <html data-theme> before first paint, so there is no flash.
     This wires the button and remembers an explicit choice; with
     no stored choice we keep following the operating system.
     ------------------------------------------------------------ */
  function initTheme() {
    var button = document.getElementById("theme-toggle");
    if (!button) return;

    var root = document.documentElement;
    var system = window.matchMedia("(prefers-color-scheme: dark)");

    function stored() {
      try {
        var t = localStorage.getItem("theme");
        return t === "dark" || t === "light" ? t : null;
      } catch (e) {
        return null;
      }
    }

    // The two <meta name="theme-color"> tags are media-scoped for the
    // no-JS case. Once a visitor picks a theme, force the right one.
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    Array.prototype.forEach.call(metas, function (m) {
      m.setAttribute("data-media", m.getAttribute("media") || "");
    });

    function paintMeta(theme, explicit) {
      Array.prototype.forEach.call(metas, function (m) {
        var own = m.getAttribute("data-media");
        if (!explicit) {
          m.setAttribute("media", own);
          return;
        }
        m.setAttribute("media", own.indexOf(theme) !== -1 ? "all" : "not all");
      });
    }

    function apply(theme, explicit) {
      root.setAttribute("data-theme", theme);
      var next = theme === "dark" ? "light" : "dark";
      var label = "Switch to " + next + " theme";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      paintMeta(theme, explicit);
    }

    apply(stored() || (system.matches ? "dark" : "light"), stored() !== null);
    button.hidden = false;

    button.addEventListener("click", function () {
      var theme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem("theme", theme); } catch (e) {}
      apply(theme, true);
    });

    system.addEventListener("change", function (e) {
      if (stored()) return; // an explicit choice wins over the system
      apply(e.matches ? "dark" : "light", false);
    });
  }

  /* ---------- 3. Clips -----------------------------------------
     Markup ships each clip paused, with a poster and controls, so
     it works with no JavaScript at all. When motion is welcome we
     take the controls away and loop it silently, playing only
     while it is on screen so a page full of clips stays cheap.
     ------------------------------------------------------------ */
  function initClips() {
    var wraps = document.querySelectorAll(".clipwrap");
    if (!wraps.length) return;

    if (reduceMotion) return; // leave every clip as a poster with controls

    var items = [];
    Array.prototype.forEach.call(wraps, function (wrap) {
      var video = wrap.querySelector("video");
      if (!video) return;
      video.removeAttribute("controls");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      items.push({ wrap: wrap, video: video });
    });
    if (!items.length) return;

    function play(item) {
      var p = item.video.play();
      if (p && p.catch) {
        p.catch(function () {
          // Autoplay refused: hand control back to the visitor.
          item.video.setAttribute("controls", "");
        });
      }
      item.wrap.classList.add("is-playing");
    }

    function pause(item) {
      item.video.pause();
      item.wrap.classList.remove("is-playing");
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach(play);
      return;
    }

    var byEl = new WeakMap();
    items.forEach(function (item) { byEl.set(item.wrap, item); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var item = byEl.get(entry.target);
        if (!item) return;
        if (entry.isIntersecting) {
          play(item);
        } else {
          pause(item);
        }
      });
    }, { rootMargin: "100px 0px", threshold: 0.2 });

    items.forEach(function (item) { io.observe(item.wrap); });
  }

  /* ---------- Contact form ------------------------------------
     The form posts over HTTPS to the endpoint in its action. This
     submits it with fetch() so the visitor stays on the page and
     gets an answer in place. With JavaScript off the browser posts
     the same form natively, so the form still works.
     ------------------------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var action = form.getAttribute("action") || "";
    // Only take over when the endpoint is one we know how to talk to.
    if (action.indexOf("https://formsubmit.co/") !== 0) return;
    if (!window.fetch || !window.FormData) return; // let the native POST happen

    var ajax = action.replace("formsubmit.co/", "formsubmit.co/ajax/");
    var statusEl = form.querySelector(".cform__status");
    var button = form.querySelector('button[type="submit"]');
    var fallback = "Could not send just now, please email gorlando.ieu2022@student.ie.edu directly.";

    function say(text, kind) {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.hidden = false;
      statusEl.setAttribute("data-state", kind || "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof form.reportValidity === "function" && !form.reportValidity()) return;

      var payload = {};
      new FormData(form).forEach(function (value, key) { payload[key] = value; });

      button.disabled = true;
      say("Sending…", "busy");

      fetch(ajax, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (data) {
          if (data && String(data.success) === "true") {
            form.reset();
            say("Thank you, your message is on its way.", "ok");
          } else {
            say(fallback, "error");
          }
        })
        .catch(function () { say(fallback, "error"); })
        .then(function () { button.disabled = false; });
    });
  }


  /* ---------- 4. Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ---------- 5. Current section in the nav ---------- */
  function initScrollSpy() {
    var links = document.querySelectorAll('#primary-nav a[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var targets = [];
    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      targets.push(section);
    });
    if (!targets.length) return;

    var current = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (current) current.removeAttribute("aria-current");
        current = map[entry.target.id];
        if (current) current.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- 6. Footer year ---------- */
  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    initNav();
    initTheme();
    initContactForm();
    initClips();
    initReveal();
    initScrollSpy();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
