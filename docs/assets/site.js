/* Boxy showcase — theme, density, mode, and the interactive demos. */
(function () {
  "use strict";

  var root = document.documentElement;
  var LS = {
    get: function (k, d) { try { return localStorage.getItem("boxy:" + k) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("boxy:" + k, v); } catch (e) { /* private mode */ } }
  };

  /* ---------------------------------------------------------------- theme */

  function currentTheme() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  function setTheme(v) {
    root.setAttribute("data-theme", v);
    LS.set("theme", v);
    paint();
  }

  function setDensity(v) {
    root.setAttribute("data-density", v);
    LS.set("density", v);
    paint();
  }

  function setMode(v) {
    root.setAttribute("data-mode", v);
    LS.set("mode", v);
    paint();
  }

  function paint() {
    var t = currentTheme();
    var d = root.getAttribute("data-density") || "comfortable";
    var m = root.getAttribute("data-mode") || "blueprint";
    each("[data-act='theme'] .val", function (el) { el.textContent = t; });
    each("[data-act='density'] .val", function (el) { el.textContent = d; });
    each("[data-act='mode'] .val", function (el) { el.textContent = m; });
    each("[data-set-mode]", function (el) {
      el.setAttribute("aria-pressed", String(el.getAttribute("data-set-mode") === m));
    });
  }

  function each(sel, fn, scope) {
    var list = (scope || document).querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  /* Restore persisted preferences before first paint is handled inline in <head>. */
  var savedDensity = LS.get("density", null);
  if (savedDensity) root.setAttribute("data-density", savedDensity);
  var savedMode = LS.get("mode", null);
  if (savedMode) root.setAttribute("data-mode", savedMode);

  /* --------------------------------------------------------------- events */

  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-act], [data-set-mode], [data-copy], [data-tab], [data-dialog], [data-toast]") : null;
    if (!el) return;

    var act = el.getAttribute("data-act");
    if (act === "theme") { setTheme(currentTheme() === "dark" ? "light" : "dark"); return; }
    if (act === "density") {
      setDensity((root.getAttribute("data-density") || "comfortable") === "compact" ? "comfortable" : "compact");
      return;
    }
    if (act === "mode") {
      var order = ["blueprint", "industrial", "editorial"];
      var cur = order.indexOf(root.getAttribute("data-mode") || "blueprint");
      setMode(order[(cur + 1) % order.length]);
      return;
    }

    var sm = el.getAttribute("data-set-mode");
    if (sm) { setMode(sm); return; }

    var copy = el.getAttribute("data-copy");
    if (copy !== null) {
      var text = copy || (el.parentNode.querySelector("code") || {}).textContent || "";
      copyText(text.trim(), el);
      return;
    }

    var tab = el.getAttribute("data-tab");
    if (tab !== null) { selectTab(el); return; }

    var dlg = el.getAttribute("data-dialog");
    if (dlg !== null) { dlg === "close" ? closeDialog() : openDialog(dlg); return; }

    if (el.getAttribute("data-toast") !== null) { toast(el.getAttribute("data-toast")); return; }
  });

  /* ----------------------------------------------------------------- copy */

  function copyText(text, btn) {
    var done = function () {
      var prev = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", prev);
      btn.textContent = "copied";
      setTimeout(function () { btn.textContent = prev; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (err) { /* nothing to do */ }
      document.body.removeChild(ta);
    }
  }

  /* ----------------------------------------------------------------- tabs */

  function selectTab(btn) {
    var group = btn.closest("[data-tabs]");
    if (!group) return;
    var name = btn.getAttribute("data-tab");
    each("[data-tab]", function (b) {
      b.setAttribute("aria-selected", String(b === btn));
    }, group);
    var panels = group.getAttribute("data-tabs");
    each("[data-panel]", function (p) {
      p.hidden = p.getAttribute("data-panel") !== name;
    }, panels === "self" ? group : document.querySelector(panels) || group);
  }

  /* Arrow-key support per the tabs spec. */
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (!t.getAttribute || t.getAttribute("data-tab") === null) return;
    if (["ArrowRight", "ArrowLeft", "Home", "End"].indexOf(e.key) === -1) return;
    var group = t.closest("[data-tabs]");
    var tabs = [].slice.call(group.querySelectorAll("[data-tab]"));
    var i = tabs.indexOf(t);
    var next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : tabs.length - 1;
    next = (next + tabs.length) % tabs.length;
    tabs[next].focus();
    selectTab(tabs[next]);
    e.preventDefault();
  });

  /* --------------------------------------------------------------- dialog */

  var lastFocus = null;

  function openDialog(id) {
    var tpl = document.getElementById(id);
    if (!tpl) return;
    lastFocus = document.activeElement;

    var scrim = document.createElement("div");
    scrim.className = "bx-scrim";
    scrim.setAttribute("data-dialog", "close");

    var host = document.createElement("div");
    host.className = "bx-dialog";
    host.setAttribute("role", "dialog");
    host.setAttribute("aria-modal", "true");
    host.innerHTML = tpl.innerHTML;

    document.body.appendChild(scrim);
    document.body.appendChild(host);
    document.body.style.overflow = "hidden";

    var focusable = host.querySelector("button, [href], input, select, textarea");
    if (focusable) focusable.focus();

    host.addEventListener("keydown", trap);
    document.addEventListener("keydown", escClose);
  }

  function trap(e) {
    if (e.key !== "Tab") return;
    var host = e.currentTarget;
    var items = [].slice.call(host.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(function (n) { return n.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  function escClose(e) { if (e.key === "Escape") closeDialog(); }

  function closeDialog() {
    each(".bx-scrim, .bx-dialog", function (n) { n.remove(); });
    document.body.style.overflow = "";
    document.removeEventListener("keydown", escClose);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------------------------------------------------------------- toast */

  function toast(kind) {
    var stack = document.querySelector(".bx-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "bx-toast-stack";
      document.body.appendChild(stack);
    }
    var map = {
      success: ["var(--bx-success)", "Deployment complete", "edge-router pushed to 310 locations.", "status"],
      error: ["var(--bx-danger)", "Build failed", "Step 4 exited with code 1.", "alert"],
      info: ["var(--bx-accent)", "Snapshot saved", "Restore points are kept for 30 days.", "status"]
    };
    var m = map[kind] || map.info;

    var el = document.createElement("div");
    el.className = "bx-toast";
    el.setAttribute("role", m[3]);
    el.style.borderInlineStartColor = m[0];
    el.innerHTML =
      '<span style="inline-size:8px;block-size:8px;background:' + m[0] + ';margin-block-start:4px;flex-shrink:0"></span>' +
      '<div style="flex:1"><p style="font-weight:600">' + m[1] + '</p>' +
      '<p class="subtle" style="font-size:var(--bx-text-sm);margin-block-start:2px">' + m[2] + '</p></div>' +
      '<button class="bx-btn bx-btn--ghost bx-btn--sm bx-btn--icon" aria-label="Dismiss">&#215;</button>';

    el.querySelector("button").addEventListener("click", function () { el.remove(); });
    stack.appendChild(el);
    if (kind !== "error") setTimeout(function () { el.remove(); }, 5000);
    while (stack.children.length > 4) stack.removeChild(stack.firstChild);
  }

  /* -------------------------------------------------------------- tooltip */

  var tip = null;
  document.addEventListener("mouseover", function (e) {
    var el = e.target.closest ? e.target.closest("[data-tip]") : null;
    if (!el || tip) return;
    var timer = setTimeout(function () {
      tip = document.createElement("div");
      tip.className = "bx-tooltip";
      tip.textContent = el.getAttribute("data-tip");
      document.body.appendChild(tip);
      var r = el.getBoundingClientRect();
      tip.style.insetBlockStart = (window.scrollY + r.top - tip.offsetHeight - 6) + "px";
      tip.style.insetInlineStart = (window.scrollX + r.left) + "px";
    }, 300);
    el.addEventListener("mouseleave", function h() {
      clearTimeout(timer);
      if (tip) { tip.remove(); tip = null; }
      el.removeEventListener("mouseleave", h);
    });
  });

  /* ----------------------------------------------------- command palette */

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      document.querySelector(".bx-dialog") ? closeDialog() : openDialog("tpl-palette");
    }
  });

  /* ------------------------------------------------------ on-this-page nav */

  var marks = document.querySelectorAll("[data-toc] a");
  if (marks.length && "IntersectionObserver" in window) {
    var byId = {};
    each("[data-toc] a", function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = byId[en.target.id];
        if (a && en.isIntersecting) {
          each("[data-toc] a", function (x) { x.removeAttribute("aria-current"); });
          a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-88px 0px -70% 0px" });
    each("[data-toc] a", function (a) {
      var t = document.getElementById(a.getAttribute("href").slice(1));
      if (t) io.observe(t);
    });
  }

  /* ------------------------------------------------------------- contrast */

  function lum(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var c = [0, 1, 2].map(function (i) {
      var v = parseInt(h.substr(i * 2, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  window.bxContrast = function (a, b) {
    var l1 = lum(a), l2 = lum(b);
    return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
  };

  /* Fill any [data-contrast="fg|bg"] element with its ratio. */
  each("[data-contrast]", function (el) {
    var p = el.getAttribute("data-contrast").split("|");
    var r = window.bxContrast(p[0], p[1]);
    el.textContent = r + ":1";
    el.setAttribute("title", r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large / UI" : "decorative only");
  });

  paint();
})();
