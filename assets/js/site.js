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

  /* ---------- 2. Clips -----------------------------------------
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

  /* ---------- 3. Scroll reveal ---------- */
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

  /* ---------- 4. Current section in the nav ---------- */
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

  /* ---------- 5. Footer year ---------- */
  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    initNav();
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
