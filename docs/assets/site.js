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

  /* -------------------------------------------------------- reduced motion */

  /* With reduced motion on, boxy.css stops most animation, so say so once at
     the top of the page. Dismissing it is remembered; the note follows the OS
     setting live if it changes while the page is open. */
  (function () {
    var main = document.querySelector(".site-main");
    if (!main || !window.matchMedia || LS.get("motion-note", null) === "dismissed") return;
    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var note = document.createElement("div");
    note.className = "motion-note bx-callout bx-callout--info";
    note.setAttribute("role", "note");
    note.innerHTML =
      '<svg class="bx-icon" aria-hidden="true"><use href="#i-info"/></svg>' +
      '<div class="motion-note__text"><p class="motion-note__title">Reduced motion is on</p>' +
      '<p class="mt-2">Your system settings ask for less motion, so most animation on this ' +
      'site is switched off, including transitions, menus and the streamed agent replies. ' +
      'Progress bars, spinners and skeleton loaders still animate, because they show that ' +
      'something is loading.</p></div>' +
      '<button type="button" class="bx-btn bx-btn--ghost bx-btn--sm bx-btn--icon" aria-label="Dismiss">' +
      '<svg class="bx-icon" aria-hidden="true"><use href="#i-x"/></svg></button>';
    note.querySelector("button").addEventListener("click", function () {
      LS.set("motion-note", "dismissed");
      note.remove();
    });
    main.insertBefore(note, main.firstChild);
    function sync() { note.hidden = !mq.matches; }
    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync);
  })();

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
      var block = el.closest(".bx-codeblock");
      var text = copy || (block ? (block.querySelector("pre") || {}).textContent : (el.parentNode.querySelector("code") || {}).textContent) || "";
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
    if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].indexOf(e.key) === -1) return;
    var group = t.closest("[data-tabs]");
    var tabs = [].slice.call(group.querySelectorAll("[data-tab]"));
    var i = tabs.indexOf(t);
    /* Vertical tablists move on Up/Down; horizontal ones on Left/Right. */
    var vertical = (t.closest("[role=tablist]") || t).getAttribute("aria-orientation") === "vertical";
    var fwd = vertical ? "ArrowDown" : "ArrowRight", back = vertical ? "ArrowUp" : "ArrowLeft";
    if ((e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "ArrowRight") && e.key !== fwd && e.key !== back) return;
    var next = e.key === fwd ? i + 1 : e.key === back ? i - 1 : e.key === "Home" ? 0 : tabs.length - 1;
    next = (next + tabs.length) % tabs.length;
    tabs[next].focus();
    selectTab(tabs[next]);
    e.preventDefault();
  });

  /* --------------------------------------------------------------- dialog */

  var lastFocus = null;

  /* Elements that can actually take focus. Not a bare [href]: an SVG icon's
     <use href="#i-x"> matches that too, sits first in the DOM, and cannot be
     focused - so a dialog would open with focus nowhere. */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openDialog(id, kind) {
    var tpl = document.getElementById(id);
    if (!tpl) return;
    lastFocus = document.activeElement;

    var scrim = document.createElement("div");
    scrim.className = "bx-scrim";
    scrim.setAttribute("data-dialog", "close");

    var host = document.createElement("div");
    host.className = kind || tpl.getAttribute("data-kind") || "bx-dialog";
    host.setAttribute("role", "dialog");
    host.setAttribute("aria-modal", "true");
    host.innerHTML = tpl.innerHTML;

    document.body.appendChild(scrim);
    document.body.appendChild(host);
    document.body.style.overflow = "hidden";

    if (host.querySelector(".bx-palette")) Palette(host);
    var focusable = host.querySelector(FOCUSABLE);
    if (focusable) focusable.focus();

    host.addEventListener("keydown", trap);
    document.addEventListener("keydown", escClose);
  }

  function trap(e) {
    if (e.key !== "Tab") return;
    var host = e.currentTarget;
    var items = [].slice.call(host.querySelectorAll(FOCUSABLE))
      .filter(function (n) { return n.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  function escClose(e) { if (e.key === "Escape") closeDialog(); }

  function closeDialog() {
    each(".bx-scrim, .bx-dialog, .bx-drawer", function (n) { n.remove(); });
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
      '<button class="bx-btn bx-btn--ghost bx-btn--sm bx-btn--icon" aria-label="Dismiss"><svg class="bx-icon" aria-hidden="true"><use href="#i-x"/></svg></button>';

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

  /* --------------------------------------------------- command palette */

  function Palette(host) {
    var input = host.querySelector(".bx-palette__search input");
    var items = [].slice.call(host.querySelectorAll(".bx-palette__item"));
    var groups = [].slice.call(host.querySelectorAll(".bx-palette__group"));
    var empty = host.querySelector(".bx-palette__empty");
    var active = null;
    items.forEach(function (it, i) {
      it.id = "palette-o" + i;
      it.tabIndex = -1;                   /* focus stays in the input */
      var lab = it.querySelector(".bx-palette__label");
      lab.setAttribute("data-text", lab.textContent);
    });
    var shown = function () { return items.filter(function (it) { return !it.hidden; }); };
    function set(it) {
      if (active) { active.classList.remove("is-active"); active.setAttribute("aria-selected", "false"); }
      active = it || null;
      if (!active) { input.removeAttribute("aria-activedescendant"); return; }
      active.classList.add("is-active");
      active.setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView({ block: "nearest" });
    }
    function filter() {
      var q = input.value.trim().toLowerCase();
      items.forEach(function (it) {
        var lab = it.querySelector(".bx-palette__label"), text = lab.getAttribute("data-text");
        var at = text.toLowerCase().indexOf(q);
        it.hidden = q !== "" && at === -1;
        lab.textContent = "";
        if (q && at > -1) {
          lab.appendChild(document.createTextNode(text.slice(0, at)));
          lab.appendChild(el("mark", null, text.slice(at, at + q.length)));
          lab.appendChild(document.createTextNode(text.slice(at + q.length)));
        } else lab.textContent = text;
      });
      groups.forEach(function (g) {
        var n = g.nextElementSibling, any = false;
        while (n && !n.classList.contains("bx-palette__group")) { if (n.classList.contains("bx-palette__item") && !n.hidden) any = true; n = n.nextElementSibling; }
        g.hidden = !any;
      });
      var vis = shown();
      if (empty) { empty.hidden = vis.length > 0; empty.textContent = 'No results for "' + input.value.trim() + '"'; }
      set(vis[0]);
    }
    function run(it) {
      if (!it) return;
      if (it.tagName === "A") { closeDialog(); location.href = it.href; return; }
      it.click();
    }
    input.addEventListener("input", filter);
    input.addEventListener("keydown", function (e) {
      var vis = shown(), i = vis.indexOf(active);
      if (e.key === "ArrowDown") { e.preventDefault(); set(vis[(i + 1) % vis.length]); }
      else if (e.key === "ArrowUp") { e.preventDefault(); set(vis[(i - 1 + vis.length) % vis.length]); }
      else if (e.key === "Home" && e.ctrlKey) { e.preventDefault(); set(vis[0]); }
      else if (e.key === "End" && e.ctrlKey) { e.preventDefault(); set(vis[vis.length - 1]); }
      else if (e.key === "Enter") { e.preventDefault(); run(active); }
    });
    /* mousemove, not mouseover: a list scrolling under a still pointer must
       not steal the selection from the keyboard. */
    host.addEventListener("mousemove", function (e) {
      var it = e.target.closest(".bx-palette__item");
      if (it && it !== active) set(it);
    });
    host.addEventListener("mousedown", function (e) { if (e.target.closest(".bx-palette__item")) e.preventDefault(); });
    host.addEventListener("click", function (e) {
      var it = e.target.closest(".bx-palette__item");
      if (!it) return;
      if (it.tagName === "A") { closeDialog(); return; }   /* the link navigates itself */
      setTimeout(closeDialog, 0);                          /* after the action's own handler */
    });
    filter();
  }

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

  /* ================================================================
     Components added in 1.1 - menus, popovers, calendar, slider,
     stepper, upload, drawer, charts, chat. Each block is independent.
     ================================================================ */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* A one-line status toast for menu actions and the like. */
  function say(title, body) {
    var stack = document.querySelector(".bx-toast-stack");
    if (!stack) { stack = el("div", "bx-toast-stack"); document.body.appendChild(stack); }
    var t = el("div", "bx-toast");
    t.setAttribute("role", "status");
    t.style.borderInlineStartColor = "var(--bx-accent)";
    var mark = el("span");
    mark.style.cssText = "inline-size:8px;block-size:8px;background:var(--bx-accent);margin-block-start:4px;flex-shrink:0";
    var txt = el("div");
    txt.style.flex = "1";
    var p1 = el("p", null, title);
    p1.style.fontWeight = "600";
    txt.appendChild(p1);
    if (body) { var p2 = el("p", "subtle", body); p2.style.fontSize = "var(--bx-text-sm)"; txt.appendChild(p2); }
    t.appendChild(mark);
    t.appendChild(txt);
    stack.appendChild(t);
    setTimeout(function () { t.remove(); }, 3000);
    while (stack.children.length > 4) stack.removeChild(stack.firstChild);
  }

  /* ------------------------------------------------ floating surfaces */

  var hasPopover = typeof HTMLElement !== "undefined" && HTMLElement.prototype.hasOwnProperty("popover");

  /* Place a floating element against a rect: below and start-aligned by
     default, flipped to the other side of whichever edge it would cross. */
  function place(float, r, gap) {
    gap = gap == null ? 4 : gap;
    var w = float.offsetWidth, h = float.offsetHeight;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var top = r.bottom + gap, left = r.left;
    if (left + w > vw - 8) left = Math.max(8, r.right - w);
    if (top + h > vh - 8 && r.top - h - gap > 8) top = r.top - h - gap;
    float.style.top = Math.max(8, top) + "px";
    float.style.left = Math.max(8, left) + "px";
  }

  function openFloat(float) {
    if (hasPopover) { if (!float.matches(":popover-open")) float.showPopover(); }
    else { float.hidden = false; float.classList.add("is-open"); }
  }
  function closeFloat(float) {
    if (!float) return;
    if (hasPopover) { if (float.matches(":popover-open")) float.hidePopover(); }
    else { float.hidden = true; float.classList.remove("is-open"); }
  }

  /* Popovers opened by a popovertarget invoker get positioned against it,
     and menus move focus to their first item. `toggle` does not bubble, so
     listen in the capture phase. */
  /* One popover can have several invokers (a row menu shared by every row),
     so remember which one was actually used. */
  var lastInvoker = {};
  document.addEventListener("click", function (e) {
    var i = e.target.closest ? e.target.closest("[popovertarget]:not([popovertargetaction='hide'])") : null;
    if (i) lastInvoker[i.getAttribute("popovertarget")] = i;
  }, true);

  document.addEventListener("toggle", function (e) {
    var f = e.target;
    if (!f.classList || !f.classList.contains("bx-float")) return;
    var inv = lastInvoker[f.id] || document.querySelector('[popovertarget="' + f.id + '"]:not([popovertargetaction="hide"])');
    if (e.newState === "open") {
      if (inv && !f.hasAttribute("data-at-pointer")) place(f, inv.getBoundingClientRect());
      if (inv) inv.setAttribute("aria-expanded", "true");
      var first = f.querySelector(".bx-menu__item:not(:disabled), .bx-cal__day[tabindex='0'], input, button");
      if (first && (f.classList.contains("bx-menu") || f.hasAttribute("data-autofocus"))) first.focus();
    } else {
      if (inv) inv.setAttribute("aria-expanded", "false");
      f.removeAttribute("data-at-pointer");
      each("[aria-expanded='true']", function (x) { x.setAttribute("aria-expanded", "false"); }, f);
    }
  }, true);

  /* Browsers without the popover API: wire invokers by hand. */
  if (!hasPopover) {
    each("[popover]", function (p) { p.hidden = true; });
    document.addEventListener("click", function (e) {
      var inv = e.target.closest ? e.target.closest("[popovertarget]") : null;
      if (inv) {
        var f = document.getElementById(inv.getAttribute("popovertarget"));
        if (f.hidden) { openFloat(f); place(f, inv.getBoundingClientRect()); } else closeFloat(f);
        return;
      }
      each(".bx-float.is-open", function (f) { if (!f.contains(e.target)) closeFloat(f); });
    });
  }

  /* ---------------------------------------------------------- menus */

  function levelItems(menu) {
    return [].slice.call(menu.children).map(function (li) {
      return li.querySelector(":scope > .bx-menu__item");
    }).filter(function (b) { return b && !b.disabled && b.getAttribute("aria-disabled") !== "true"; });
  }

  document.addEventListener("keydown", function (e) {
    var item = e.target.closest ? e.target.closest(".bx-menu__item") : null;
    if (!item) return;
    var menu = item.closest(".bx-menu");
    var items = levelItems(menu);
    var i = items.indexOf(item);
    var k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp" || k === "Home" || k === "End") {
      var n = k === "ArrowDown" ? i + 1 : k === "ArrowUp" ? i - 1 : k === "Home" ? 0 : items.length - 1;
      items[(n + items.length) % items.length].focus();
      e.preventDefault();
    } else if (k === "ArrowRight" && item.getAttribute("aria-haspopup") === "menu") {
      openSub(item);
      e.preventDefault();
    } else if (k === "ArrowLeft" || (k === "Escape" && menu.parentElement.closest(".bx-menu"))) {
      var parent = menu.parentElement.closest(".bx-menu") && menu.previousElementSibling;
      if (parent && parent.classList.contains("bx-menu__item")) {
        collapse(parent);
        parent.focus();
        e.preventDefault();
        e.stopPropagation();
      }
    } else if (k.length === 1 && /\S/.test(k)) {
      /* Type-ahead: jump to the next item starting with that letter. */
      for (var j = 1; j <= items.length; j++) {
        var c = items[(i + j) % items.length];
        if (c.textContent.trim().toLowerCase().indexOf(k.toLowerCase()) === 0) { c.focus(); break; }
      }
    }
  });

  /* Close a submenu trigger and everything open beneath it. */
  function collapse(trigger) {
    trigger.setAttribute("aria-expanded", "false");
    var sub = trigger.nextElementSibling;
    if (sub) each(".bx-menu__item[aria-expanded='true']", function (x) { x.setAttribute("aria-expanded", "false"); }, sub);
  }

  /* Open a submenu, closing its siblings, and flip it to the other side if
     it would leave the viewport. `focusFirst` is for the keyboard path. */
  function expand(trigger, focusFirst) {
    var menu = trigger.closest(".bx-menu");
    each(":scope > li > .bx-menu__item[aria-expanded='true']", function (x) { if (x !== trigger) collapse(x); }, menu);
    trigger.setAttribute("aria-expanded", "true");
    var sub = trigger.nextElementSibling;
    if (!sub) return;
    sub.classList.remove("is-flip");
    if (sub.getBoundingClientRect().right > document.documentElement.clientWidth - 8) sub.classList.add("is-flip");
    var first = levelItems(sub)[0];
    if (focusFirst && first) first.focus();
  }
  function openSub(trigger) { expand(trigger, true); }

  document.addEventListener("click", function (e) {
    var item = e.target.closest ? e.target.closest(".bx-menu__item") : null;
    if (!item || item.disabled) return;
    if (item.getAttribute("aria-haspopup") === "menu") {
      clearTimeout(intent);
      /* A click (or touch) toggles; the keyboard's Enter lands here too. */
      item.getAttribute("aria-expanded") === "true" ? collapse(item) : expand(item, e.detail === 0);
      return;
    }
    var role = item.getAttribute("role");
    if (role === "menuitemcheckbox") {
      item.setAttribute("aria-checked", String(item.getAttribute("aria-checked") !== "true"));
      return;
    }
    if (role === "menuitemradio") {
      each("[role='menuitemradio']", function (r) { r.setAttribute("aria-checked", String(r === item)); }, item.closest("ul"));
      /* A radio menu can name the element that shows its current value. */
      var shows = document.getElementById(item.closest("ul").getAttribute("data-sets") || "");
      if (shows) { shows.textContent = item.firstChild.textContent.trim(); closeFloat(item.closest(".bx-float")); }
      return;
    }
    var msg = item.getAttribute("data-say");
    closeFloat(item.closest(".bx-float"));
    if (msg) say(msg, item.getAttribute("data-say-body"));
  });

  /* Pointer: focus follows the pointer, so there is only ever one
     highlighted item and the keyboard carries on from wherever the mouse
     left off. Submenus open and close through the same aria-expanded state
     as the keyboard, after a short hover intent - long enough that cutting
     diagonally across a sibling on the way into an open submenu does not
     snap it shut, short enough to feel immediate. */
  var intent = null;
  document.addEventListener("mouseover", function (e) {
    var item = e.target.closest ? e.target.closest(".bx-menu__item") : null;
    if (!item || item.disabled) return;
    if (document.activeElement !== item) item.focus({ preventScroll: true });
    var opens = item.getAttribute("aria-haspopup") === "menu";
    clearTimeout(intent);
    intent = setTimeout(function () {
      if (opens) expand(item, false);
      else each(":scope > li > .bx-menu__item[aria-expanded='true']", collapse, item.closest(".bx-menu"));
    }, opens ? 80 : 200);
  });

  /* ---------------------------------------------------- context menu */

  var ctxReturn = null;
  function openContext(menu, x, y, from) {
    ctxReturn = from || document.activeElement;
    menu.setAttribute("data-at-pointer", "");
    openFloat(menu);
    place(menu, { left: x, right: x, top: y, bottom: y }, 0);
    var first = levelItems(menu)[0];
    if (first) first.focus();
  }
  document.addEventListener("contextmenu", function (e) {
    var zone = e.target.closest ? e.target.closest("[data-context]") : null;
    if (!zone) return;
    var menu = document.getElementById(zone.getAttribute("data-context"));
    if (!menu) return;
    e.preventDefault();
    var row = e.target.closest("[data-context-item]");
    each("[data-context-item][aria-selected='true']", function (r) { r.setAttribute("aria-selected", "false"); }, zone);
    if (row) row.setAttribute("aria-selected", "true");
    openContext(menu, e.clientX, e.clientY, row || zone);
  });
  /* Keyboard parity: Shift+F10 or the Menu key opens it at the focused row. */
  document.addEventListener("keydown", function (e) {
    if (!((e.shiftKey && e.key === "F10") || e.key === "ContextMenu")) return;
    var zone = e.target.closest ? e.target.closest("[data-context]") : null;
    if (!zone) return;
    e.preventDefault();
    var r = e.target.getBoundingClientRect();
    openContext(document.getElementById(zone.getAttribute("data-context")), r.left + 16, r.bottom, e.target);
  });
  document.addEventListener("toggle", function (e) {
    if (e.newState === "closed" && e.target.hasAttribute && e.target.hasAttribute("data-context-menu") && ctxReturn) {
      if (ctxReturn.focus) ctxReturn.focus();
      ctxReturn = null;
    }
  }, true);

  /* -------------------------------------------------------- calendar */

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  function ymd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function parse(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; }
  function day0(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function short(d) { return MONTHS[d.getMonth()].slice(0, 3) + " " + d.getDate(); }
  var TODAY = day0(new Date());

  function Calendar(root) {
    var range = root.getAttribute("data-cal") === "range";
    var input = document.getElementById(root.getAttribute("data-cal-input") || "");
    var label = document.getElementById(root.getAttribute("data-cal-label") || "");
    var st = {
      view: new Date(TODAY.getFullYear(), TODAY.getMonth(), 1),
      focus: TODAY,
      sel: input ? parse(input.value) : null,
      a: null, b: null
    };
    if (range) { st.b = TODAY; st.a = addDays(TODAY, -6); }
    if (st.sel) { st.focus = st.sel; st.view = new Date(st.sel.getFullYear(), st.sel.getMonth(), 1); }

    var head = el("div", "bx-cal__head");
    var prev = el("button", "bx-btn bx-btn--ghost bx-btn--sm bx-btn--icon", "‹");
    var next = el("button", "bx-btn bx-btn--ghost bx-btn--sm bx-btn--icon", "›");
    prev.type = next.type = "button";
    prev.setAttribute("aria-label", "Previous month");
    next.setAttribute("aria-label", "Next month");
    var title = el("p", "bx-cal__title");
    title.setAttribute("aria-live", "polite");
    head.appendChild(title); head.appendChild(prev); head.appendChild(next);
    var grid = el("div", "bx-cal__grid");
    grid.setAttribute("role", "grid");
    var mount = root.querySelector("[data-cal-mount]") || root;
    mount.insertBefore(grid, mount.firstChild);
    mount.insertBefore(head, grid);

    prev.addEventListener("click", function () { shift(-1); });
    next.addEventListener("click", function () { shift(1); });

    function shift(n) {
      st.view = new Date(st.view.getFullYear(), st.view.getMonth() + n, 1);
      st.focus = new Date(st.view);
      render();
    }

    function inRange(d) { return st.a && st.b && d > st.a && d < st.b; }
    function same(a, b) { return a && b && a.getTime() === b.getTime(); }

    function render(focusIt) {
      title.textContent = MONTHS[st.view.getMonth()] + " " + st.view.getFullYear();
      grid.textContent = "";
      DOW.forEach(function (d) { var c = el("span", "bx-cal__dow", d); c.setAttribute("role", "columnheader"); grid.appendChild(c); });
      var start = addDays(st.view, -((st.view.getDay() + 6) % 7));
      for (var i = 0; i < 42; i++) {
        var d = addDays(start, i);
        if (i === 35 && d.getMonth() !== st.view.getMonth()) break;
        var b = el("button", "bx-cal__day", String(d.getDate()));
        b.type = "button";
        b.setAttribute("role", "gridcell");
        b.setAttribute("data-date", ymd(d));
        b.setAttribute("aria-label", d.toDateString());
        b.tabIndex = same(d, st.focus) ? 0 : -1;
        if (d.getMonth() !== st.view.getMonth()) b.setAttribute("data-out", "");
        if (same(d, TODAY)) { b.setAttribute("data-today", ""); b.setAttribute("aria-current", "date"); }
        if (range) {
          if (same(d, st.a) || same(d, st.b)) b.setAttribute("aria-selected", "true");
          else if (inRange(d)) b.setAttribute("data-range", "");
        } else if (same(d, st.sel)) b.setAttribute("aria-selected", "true");
        grid.appendChild(b);
      }
      if (focusIt) { var f = grid.querySelector("[tabindex='0']"); if (f) f.focus(); }
      if (label && range && st.a && st.b) {
        label.textContent = short(st.a) + " – " + short(st.b) + ", " + st.b.getFullYear();
      }
    }

    grid.addEventListener("click", function (e) {
      var b = e.target.closest(".bx-cal__day");
      if (!b) return;
      var d = parse(b.getAttribute("data-date"));
      st.focus = d;
      if (range) {
        if (!st.a || st.b) { st.a = d; st.b = null; }
        else if (d < st.a) { st.b = st.a; st.a = d; }
        else st.b = d;
        each("[role='menuitemradio']", function (r) { r.setAttribute("aria-checked", String(r.getAttribute("data-preset") === "custom")); }, root);
        render(true);
      } else {
        st.sel = d;
        if (input) { input.value = ymd(d); input.dispatchEvent(new Event("change", { bubbles: true })); }
        render();
        closeFloat(root.closest(".bx-float"));
      }
    });

    grid.addEventListener("keydown", function (e) {
      var map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      var d = st.focus;
      if (map[e.key]) d = addDays(d, map[e.key]);
      else if (e.key === "Home") d = addDays(d, -((d.getDay() + 6) % 7));
      else if (e.key === "End") d = addDays(d, 6 - ((d.getDay() + 6) % 7));
      else if (e.key === "PageUp") d = new Date(d.getFullYear(), d.getMonth() - 1, Math.min(d.getDate(), 28));
      else if (e.key === "PageDown") d = new Date(d.getFullYear(), d.getMonth() + 1, Math.min(d.getDate(), 28));
      else return;
      e.preventDefault();
      st.focus = d;
      st.view = new Date(d.getFullYear(), d.getMonth(), 1);
      render(true);
    });

    /* Presets: a list of radios beside the grid. */
    root.addEventListener("click", function (e) {
      var p = e.target.closest("[data-preset]");
      if (p) {
        var v = p.getAttribute("data-preset");
        if (v === "custom") return;
        if (v === "month") { st.a = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1); st.b = TODAY; }
        else if (v === "quarter") { st.a = new Date(TODAY.getFullYear(), Math.floor(TODAY.getMonth() / 3) * 3, 1); st.b = TODAY; }
        else { st.b = TODAY; st.a = addDays(TODAY, -(+v - 1)); }
        st.focus = st.b;
        st.view = new Date(st.b.getFullYear(), st.b.getMonth(), 1);
        render();
      }
      var act = e.target.closest("[data-cal-act]");
      if (!act) return;
      var a = act.getAttribute("data-cal-act");
      if (a === "today") { st.sel = TODAY; st.focus = TODAY; st.view = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1); if (input) input.value = ymd(TODAY); render(); closeFloat(root.closest(".bx-float")); }
      if (a === "clear") { st.sel = null; if (input) input.value = ""; render(); }
      if (a === "apply") { closeFloat(root.closest(".bx-float")); if (st.a && st.b) say("Range applied", short(st.a) + " – " + short(st.b)); }
    });

    if (input) input.addEventListener("change", function () {
      var d = parse(input.value.trim());
      if (d) { st.sel = d; st.focus = d; st.view = new Date(d.getFullYear(), d.getMonth(), 1); render(); }
    });

    render();
  }
  each("[data-cal]", function (n) { Calendar(n); });

  /* ---------------------------------------------------------- slider */

  function paintSlider(s) {
    var min = +s.min || 0, max = s.max === "" ? 100 : +s.max;
    s.style.setProperty("--val", ((s.value - min) / (max - min) * 100) + "%");
    var suffix = s.getAttribute("data-suffix") || "";
    each('[data-out="' + s.id + '"]', function (o) {
      if (o.tagName === "INPUT") o.value = s.value; else o.textContent = s.value + suffix;
    });
  }
  each(".bx-slider", paintSlider);
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains("bx-slider")) paintSlider(t);
    /* A number field bound to a slider drives it back. */
    var bound = t.getAttribute && t.getAttribute("data-out");
    if (bound && t.tagName === "INPUT") {
      var s = document.getElementById(bound);
      if (s && t.value !== "") { s.value = t.value; paintSlider(s); }
    }
  });

  /* --------------------------------------------------------- stepper */

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-step]") : null;
    if (!b) return;
    var input = b.parentNode.querySelector("input");
    var step = +(input.step || 1) * +b.getAttribute("data-step");
    var v = (+input.value || 0) + step;
    if (input.min !== "") v = Math.max(+input.min, v);
    if (input.max !== "") v = Math.min(+input.max, v);
    input.value = v;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  /* ---------------------------------------------------------- upload */

  function fmtSize(n) {
    return n < 1024 ? n + " B" : n < 1048576 ? (n / 1024).toFixed(1) + " KB" : (n / 1048576).toFixed(1) + " MB";
  }
  function addFile(list, name, size) {
    var li = el("li", "bx-file");
    var ext = (name.split(".").pop() || "file").slice(0, 4);
    var tooBig = size > 25 * 1048576;
    li.appendChild(el("span", "bx-file__type", ext));
    var mid = el("div");
    mid.style.minInlineSize = "0";
    mid.appendChild(el("p", "bx-file__name", name));
    var meta = el("p", "bx-file__meta");
    mid.appendChild(meta);
    li.appendChild(mid);
    var state = el("span", "bx-label");
    li.appendChild(state);
    var x = el("button", "bx-btn bx-btn--ghost bx-btn--sm bx-btn--icon", "×");
    x.type = "button";
    x.setAttribute("aria-label", "Remove " + name);
    x.addEventListener("click", function () { clearInterval(timer); li.remove(); });
    li.appendChild(x);
    list.appendChild(li);
    list.hidden = false;
    var timer;
    if (tooBig) {
      li.classList.add("bx-file--error");
      meta.textContent = fmtSize(size) + " · exceeds the 25 MB limit";
      meta.style.color = "var(--bx-ink-danger)";
      state.textContent = "Failed";
      state.style.color = "var(--bx-ink-danger)";
      return;
    }
    var bar = el("span", "bx-progress");
    var fill = el("i");
    bar.appendChild(fill);
    var pct = el("span", null, "0%");
    meta.appendChild(el("span", null, fmtSize(size)));
    meta.appendChild(bar);
    meta.appendChild(pct);
    state.textContent = "Uploading";
    var p = 0;
    timer = setInterval(function () {
      p = Math.min(100, p + 8 + Math.floor(Math.random() * 16));
      fill.style.inlineSize = p + "%";
      pct.textContent = p + "%";
      if (p >= 100) {
        clearInterval(timer);
        bar.remove(); pct.remove();
        state.textContent = "Done";
        state.style.color = "var(--bx-ink-success)";
      }
    }, 160);
  }
  each(".bx-drop", function (zone) {
    var list = document.getElementById(zone.getAttribute("data-files"));
    var input = zone.querySelector("input[type=file]");
    var take = function (files) { [].forEach.call(files, function (f) { addFile(list, f.name, f.size); }); };
    zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("is-over"); });
    zone.addEventListener("dragleave", function () { zone.classList.remove("is-over"); });
    zone.addEventListener("drop", function (e) { e.preventDefault(); zone.classList.remove("is-over"); take(e.dataTransfer.files); });
    if (input) input.addEventListener("change", function () { take(input.files); input.value = ""; });
  });

  /* ---------------------------------------------------------- drawer */

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-drawer]") : null;
    if (t) openDialog(t.getAttribute("data-drawer"), "bx-drawer");
  });

  /* ------------------------------------------------ in-place filter */

  /* A radio group named filter-* narrows the [data-cat] items in its
     [data-filter] scope, and reports the count to a live region. */
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t.name || t.name.indexOf("filter-") !== 0) return;
    var scope = t.closest("[data-filter]");
    if (!scope) return;
    var shown = 0;
    each("[data-cat]", function (n) {
      n.hidden = t.value !== "all" && n.getAttribute("data-cat") !== t.value;
      if (!n.hidden) shown++;
    }, scope);
    each("[data-filter-count]", function (c) { c.textContent = shown + (shown === 1 ? " question" : " questions"); }, scope);
  });

  /* ------------------------------------------------- pricing toggle */

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name !== "billing") return;
    var scope = t.closest("[data-billing]") || document;
    each("[data-monthly]", function (p) { p.textContent = p.getAttribute("data-" + t.value); }, scope);
    each("[data-per]", function (p) { p.textContent = t.value === "yearly" ? "/mo, billed yearly" : "/month"; }, scope);
  });

  /* ---------------------------------------------------------- charts */

  var SVGNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  /* The axis top is four nice steps, so every gridline lands on a round value. */
  function niceMax(v) {
    var raw = v / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p * 4;
  }
  function fmt(v, unit) {
    var s = v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + "k" : String(Math.round(v * 10) / 10);
    return unit === "$" ? "$" + s : s + (unit || "");
  }

  function renderChart(box) {
    var kind = box.getAttribute("data-chart");
    var labels = JSON.parse(box.getAttribute("data-labels"));
    var s1 = JSON.parse(box.getAttribute("data-series"));
    var s2 = box.getAttribute("data-compare") ? JSON.parse(box.getAttribute("data-compare")) : null;
    var n1 = box.getAttribute("data-name") || "Current", n2 = box.getAttribute("data-compare-name") || "Previous";
    var unit = box.getAttribute("data-unit") || "";
    var W = box.clientWidth, H = +(box.getAttribute("data-height") || 200);
    if (!W) return;
    var m = { t: 8, r: 8, b: 24, l: 40 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var max = niceMax(Math.max.apply(null, s1.concat(s2 || [])) * 1.05);
    var y = function (v) { return m.t + ih - v / max * ih; };

    var old = box.querySelector("svg");
    if (old) old.remove();
    var root = svg("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });
    box.appendChild(root);

    for (var g = 0; g <= 4; g++) {
      var gy = Math.round(y(max * g / 4)) + 0.5;
      svg("line", { x1: m.l, x2: W - m.r, y1: gy, y2: gy, "class": g ? "grid" : "axis" }, root);
      svg("text", { x: m.l - 8, y: gy + 3, "text-anchor": "end", "class": "tick" }, root).textContent = fmt(max * g / 4, unit);
    }

    var xs = [], band = iw / labels.length;
    var every = Math.ceil(labels.length / Math.max(1, Math.floor(iw / 56)));

    if (kind === "bar") {
      var bw = Math.max(4, Math.floor(band - Math.min(16, band * 0.4)));
      var hot = +(box.getAttribute("data-hot") || -1);
      labels.forEach(function (l, i) {
        var x = Math.round(m.l + band * i + (band - bw) / 2);
        xs.push(x + bw / 2);
        var top = Math.round(y(s1[i]));
        svg("rect", { x: x, y: top, width: bw, height: m.t + ih - top, "class": "bar" + (i === hot ? "" : hot >= 0 ? " bar--muted" : "") }, root);
        if (labels.length <= 12) svg("text", { x: x + bw / 2, y: top - 6, "text-anchor": "middle", "class": "label" }, root).textContent = fmt(s1[i], unit);
        svg("text", { x: x + bw / 2, y: H - 6, "text-anchor": "middle", "class": "tick" }, root).textContent = l;
      });
    } else {
      labels.forEach(function (l, i) {
        var x = m.l + (labels.length === 1 ? iw / 2 : iw * i / (labels.length - 1));
        xs.push(x);
        if (i % every === 0 || i === labels.length - 1) {
          svg("text", { x: x, y: H - 6, "text-anchor": i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle", "class": "tick" }, root).textContent = l;
        }
      });
      var pts = function (s) { return s.map(function (v, i) { return xs[i].toFixed(1) + "," + y(v).toFixed(1); }).join(" "); };
      if (s2) svg("polyline", { points: pts(s2), "class": "s2" }, root);
      svg("polygon", { points: m.l + "," + (m.t + ih) + " " + pts(s1) + " " + (W - m.r) + "," + (m.t + ih), "class": "s1-area" }, root);
      svg("polyline", { points: pts(s1), "class": "s1" }, root);
    }

    /* Hover and keyboard layer: the crosshair snaps to the nearest X, the
       readout lists every series there. Values lead, names follow. */
    var cross = svg("line", { y1: m.t, y2: m.t + ih, "class": "cross", visibility: "hidden" }, root);
    var dot = kind === "bar" ? null : svg("rect", { width: 8, height: 8, "class": "dot", visibility: "hidden" }, root);
    var tip = box.querySelector(".bx-chart__tip") || el("div", "bx-chart__tip");
    tip.hidden = true;
    box.appendChild(tip);

    function show(i) {
      if (i < 0) { cross.setAttribute("visibility", "hidden"); if (dot) dot.setAttribute("visibility", "hidden"); tip.hidden = true; return; }
      var x = Math.round(xs[i]) + 0.5;
      if (kind !== "bar") {
        cross.setAttribute("x1", x); cross.setAttribute("x2", x); cross.setAttribute("visibility", "visible");
        dot.setAttribute("x", x - 4.5); dot.setAttribute("y", y(s1[i]) - 4); dot.setAttribute("visibility", "visible");
      }
      each(".bar", function (b, j) { b.classList.toggle("is-hot", j === i); }, root);
      tip.textContent = "";
      tip.appendChild(el("p", "bx-label", labels[i])).style.color = "var(--bx-ink-inverse-muted)";
      var row = function (v, name, muted) {
        var p = el("p");
        var k = el("i", muted ? "muted" : null);
        p.appendChild(k);
        p.appendChild(el("b", null, fmt(v, unit)));
        p.appendChild(el("span", null, name));
        tip.appendChild(p);
      };
      row(s1[i], n1);
      if (s2) row(s2[i], n2, true);
      tip.hidden = false;
      var left = xs[i] + 12;
      if (left + tip.offsetWidth > W) left = xs[i] - tip.offsetWidth - 12;
      tip.style.left = left + "px";
      tip.style.top = m.t + "px";
    }
    var hit = svg("rect", { x: m.l, y: m.t, width: iw, height: ih, fill: "transparent" }, root);
    hit.addEventListener("pointermove", function (e) {
      var r = root.getBoundingClientRect(), px = e.clientX - r.left, best = 0;
      xs.forEach(function (x, i) { if (Math.abs(x - px) < Math.abs(xs[best] - px)) best = i; });
      box._i = best;
      show(best);
    });
    hit.addEventListener("pointerleave", function () { show(-1); });
    box._show = show;
    box._n = labels.length;
  }

  each("[data-chart]", function (box) {
    box.tabIndex = 0;
    box.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      box._i = Math.max(0, Math.min(box._n - 1, (box._i == null ? box._n : box._i) + (e.key === "ArrowRight" ? 1 : -1)));
      box._show(box._i);
    });
    box.addEventListener("blur", function () { if (box._show) box._show(-1); });
    renderChart(box);
    if ("ResizeObserver" in window) {
      var w = box.clientWidth;
      new ResizeObserver(function () { if (box.clientWidth !== w) { w = box.clientWidth; renderChart(box); } }).observe(box);
    }
  });

  /* Sparklines: a single polyline, no axes, no dots. */
  each("svg[data-spark]", function (s) {
    var v = s.getAttribute("data-spark").split(",").map(Number);
    var lo = Math.min.apply(null, v), hi = Math.max.apply(null, v);
    s.setAttribute("viewBox", "0 0 96 32");
    s.setAttribute("preserveAspectRatio", "none");
    svg("polyline", {
      points: v.map(function (n, i) { return (i * 96 / (v.length - 1)).toFixed(1) + "," + (30 - (n - lo) / (hi - lo || 1) * 28).toFixed(1); }).join(" "),
      "vector-effect": "non-scaling-stroke"
    }, s);
  });

  /* Uptime strips: one cell per day from a compact string (o ok, w warn,
     d down, - no data). Each cell carries its own tooltip. */
  each("[data-uptime]", function (strip) {
    var s = strip.getAttribute("data-uptime");
    var map = { o: ["", "100% uptime"], w: ["warn", "Degraded performance"], d: ["down", "Major outage"], "-": ["none", "No data"] };
    for (var i = 0; i < s.length; i++) {
      var c = el("i");
      var d = addDays(TODAY, i - s.length + 1);
      var k = map[s[i]] || map.o;
      if (k[0]) c.setAttribute("data-s", k[0]);
      c.setAttribute("data-tip", short(d) + " · " + k[1]);
      strip.appendChild(c);
    }
  });

  /* ------------------------------------------------------ chat demo */

  var REPLY = "Done. I added a retry with exponential backoff to the webhook sender, capped at five attempts, and the failing test now passes. The change is 14 lines in src/webhooks/send.ts.";
  each("[data-composer]", function (form) {
    var thread = document.getElementById(form.getAttribute("data-composer"));
    var ta = form.querySelector("textarea");
    var scroller = thread.closest("[data-scroll]") || thread;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function turn(kind, who, text) {
      var m = el("div", "bx-msg bx-msg--" + kind);
      var av = el("span", "bx-avatar bx-avatar--sm" + (kind === "agent" ? " bx-avatar--inverse" : ""), kind === "agent" ? "AI" : "YO");
      av.setAttribute("aria-hidden", "true");
      var w = el("div", "bx-msg__who");
      w.appendChild(el("span", "bx-label", who));
      m.appendChild(av);
      m.appendChild(w);
      var body = el("div", "bx-msg__body");
      var p = el("p", null, text);
      body.appendChild(p);
      m.appendChild(body);
      thread.appendChild(m);
      scroller.scrollTop = scroller.scrollHeight;
      return p;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = ta.value.trim();
      if (!text) return;
      turn("user", "You", text);
      ta.value = "";
      var p = turn("agent", "Agent", "");
      var caret = el("span", "bx-caret");
      caret.setAttribute("aria-hidden", "true");
      p.appendChild(caret);
      var i = 0;
      var tick = setInterval(function () {
        i = reduce ? REPLY.length : Math.min(REPLY.length, i + 3);
        p.firstChild && p.firstChild.nodeType === 3 ? (p.firstChild.nodeValue = REPLY.slice(0, i)) : p.insertBefore(document.createTextNode(REPLY.slice(0, i)), caret);
        scroller.scrollTop = scroller.scrollHeight;
        if (i >= REPLY.length) { clearInterval(tick); caret.remove(); }
      }, 24);
    });
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
    });
  });


  /* ================================================================
     1.1 part two - combobox, multi-select, kanban, panes, grid,
     colour picker, inbox.
     ================================================================ */

  /* ------------------------------------------- combobox + multi-select */

  /* One engine for both. The listbox is a manual popover (top layer, no
     light dismiss - focus stays in the input, so outside clicks are handled
     here). The highlighted option is aria-activedescendant. */
  function Listbox(root) {
    var multi = root.classList.contains("bx-multi");
    var input = root.querySelector("input");
    var list = document.getElementById(root.getAttribute("data-listbox"));
    var options = [].slice.call(list.querySelectorAll(".bx-option"));
    var empty = list.querySelector(".bx-listbox__empty");
    var active = -1;
    options.forEach(function (o, i) { if (!o.id) o.id = list.id + "-o" + i; o.setAttribute("data-label", o.firstChild.textContent.trim()); });

    function visible() { return options.filter(function (o) { return !o.hidden; }); }
    function open() {
      if (root.hasAttribute("data-open")) return;
      root.setAttribute("data-open", "");
      input.setAttribute("aria-expanded", "true");
      if (hasPopover) list.showPopover(); else list.hidden = false;
      list.style.minWidth = root.offsetWidth + "px";
      place(list, root.getBoundingClientRect());
    }
    function close() {
      root.removeAttribute("data-open");
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      setActive(-1);
      if (hasPopover) { if (list.matches(":popover-open")) list.hidePopover(); } else list.hidden = true;
    }
    function setActive(i) {
      options.forEach(function (o) { o.classList.remove("is-active"); });
      var vis = visible();
      active = i;
      if (i < 0 || !vis[i]) { input.removeAttribute("aria-activedescendant"); return; }
      vis[i].classList.add("is-active");
      input.setAttribute("aria-activedescendant", vis[i].id);
      vis[i].scrollIntoView({ block: "nearest" });
    }
    /* Filter, and wrap the matched substring in <mark> - built with text
       nodes, never innerHTML, because option labels are data. */
    function filter() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      options.forEach(function (o) {
        var label = o.getAttribute("data-label");
        var at = label.toLowerCase().indexOf(q);
        o.hidden = q !== "" && at === -1;
        if (!o.hidden) shown++;
        var first = o.firstChild;
        var span = document.createElement("span");
        if (q && at > -1) {
          span.appendChild(document.createTextNode(label.slice(0, at)));
          span.appendChild(el("mark", null, label.slice(at, at + q.length)));
          span.appendChild(document.createTextNode(label.slice(at + q.length)));
        } else span.textContent = label;
        o.replaceChild(span, first);
      });
      if (empty) { empty.hidden = shown > 0; empty.textContent = 'No results for "' + input.value.trim() + '"'; }
      /* A group label with nothing left under it goes too. */
      each(".bx-listbox__label", function (lab) {
        var n = lab.nextElementSibling, any = false;
        while (n && !n.classList.contains("bx-listbox__label")) { if (n.classList.contains("bx-option") && !n.hidden) any = true; n = n.nextElementSibling; }
        lab.hidden = !any;
      }, list);
      setActive(shown ? 0 : -1);
      /* Re-place after the list changes height, so it opens below the field
         whenever it fits there instead of flipping on its unfiltered size. */
      if (root.hasAttribute("data-open")) place(list, root.getBoundingClientRect());
    }
    function choose(o) {
      if (!o || o.getAttribute("aria-disabled") === "true") return;
      if (multi) {
        var on = o.getAttribute("aria-selected") !== "true";
        o.setAttribute("aria-selected", String(on));
        on ? addTag(o) : removeTag(o.id);
        input.value = "";
        filter();
        input.focus();
      } else {
        options.forEach(function (x) { x.setAttribute("aria-selected", String(x === o)); });
        input.value = o.getAttribute("data-label");
        close();
      }
    }
    function addTag(o) {
      var t = el("span", "bx-tag", o.getAttribute("data-label"));
      t.setAttribute("data-for", o.id);
      var x = el("button", "bx-tag__x");
      x.type = "button";
      x.setAttribute("aria-label", "Remove " + o.getAttribute("data-label"));
      x.innerHTML = '<svg class="bx-icon bx-icon--sm" aria-hidden="true"><use href="#i-x"/></svg>';
      t.appendChild(x);
      root.insertBefore(t, input);
      count();
    }
    function removeTag(id) {
      var t = root.querySelector('.bx-tag[data-for="' + id + '"]');
      if (t) t.remove();
      var o = document.getElementById(id);
      if (o) o.setAttribute("aria-selected", "false");
      count();
    }
    function count() {
      var c = document.getElementById(root.getAttribute("data-count") || "");
      if (c) c.textContent = root.querySelectorAll(".bx-tag").length + " selected";
    }

    input.addEventListener("input", function () { open(); filter(); });
    input.addEventListener("focus", function () { if (multi) { open(); filter(); } });
    input.addEventListener("keydown", function (e) {
      var vis = visible();
      if (e.key === "ArrowDown") { e.preventDefault(); if (!root.hasAttribute("data-open")) { open(); filter(); } else setActive(Math.min(vis.length - 1, active + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(0, active - 1)); }
      else if (e.key === "Enter" && root.hasAttribute("data-open")) { e.preventDefault(); choose(vis[active]); }
      else if (e.key === "Escape") { if (root.hasAttribute("data-open")) { e.preventDefault(); close(); } }
      else if (e.key === "Backspace" && multi && input.value === "") {
        var tags = root.querySelectorAll(".bx-tag");
        if (tags.length) removeTag(tags[tags.length - 1].getAttribute("data-for"));
      }
    });
    list.addEventListener("mousedown", function (e) { e.preventDefault(); });   /* keep focus in the input */
    list.addEventListener("click", function (e) { choose(e.target.closest(".bx-option")); });
    list.addEventListener("mousemove", function (e) {
      var o = e.target.closest(".bx-option");
      if (o) setActive(visible().indexOf(o));
    });
    root.addEventListener("click", function (e) {
      var x = e.target.closest(".bx-tag__x");
      if (x) { removeTag(x.parentNode.getAttribute("data-for")); input.focus(); return; }
      if (e.target.closest("[data-clear]")) {
        [].slice.call(root.querySelectorAll(".bx-tag")).forEach(function (t) { removeTag(t.getAttribute("data-for")); });
        input.focus(); return;
      }
      if (e.target.closest(".bx-combo__toggle")) {
        root.hasAttribute("data-open") ? close() : (open(), filter(), input.focus());
        return;
      }
      if (multi && e.target === root) input.focus();
    });
    document.addEventListener("pointerdown", function (e) {
      if (root.hasAttribute("data-open") && !root.contains(e.target) && !list.contains(e.target)) close();
    });
    options.forEach(function (o) { if (multi && o.getAttribute("aria-selected") === "true") addTag(o); });
  }
  each(".bx-combo[data-listbox], .bx-multi[data-listbox]", Listbox);

  /* ------------------------------------------------------------ kanban */

  var live = el("div", "bx-sr");
  live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);
  function announce(msg) { live.textContent = ""; setTimeout(function () { live.textContent = msg; }, 30); }

  function wip(board) {
    each(".bx-kanban__col", function (col) {
      var n = col.querySelectorAll(".bx-kcard").length;
      var lim = +col.getAttribute("data-limit") || 0;
      var w = col.querySelector(".bx-kanban__wip");
      if (w) w.textContent = lim ? n + " / " + lim : String(n);
      col.toggleAttribute("data-over-limit", lim > 0 && n > lim);
      if (w) w.toggleAttribute("data-over", lim > 0 && n > lim);
    }, board);
  }
  each(".bx-kanban", function (board) {
    var dragged = null;
    var slot = el("li", "bx-kanban__slot");
    slot.setAttribute("aria-hidden", "true");
    board.addEventListener("dragstart", function (e) {
      dragged = e.target.closest(".bx-kcard");
      if (!dragged) return;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", dragged.id || "card");
      setTimeout(function () { dragged.classList.add("is-ghost"); }, 0);
    });
    board.addEventListener("dragover", function (e) {
      var list = e.target.closest(".bx-kanban__list");
      if (!dragged || !list) return;
      e.preventDefault();
      var after = [].slice.call(list.querySelectorAll(".bx-kcard:not(.is-ghost)")).find(function (c) {
        var r = c.getBoundingClientRect(); return e.clientY < r.top + r.height / 2;
      });
      after ? list.insertBefore(slot, after) : list.appendChild(slot);
    });
    board.addEventListener("drop", function (e) {
      if (!dragged || !slot.parentNode) return;
      e.preventDefault();
      slot.parentNode.replaceChild(dragged, slot);
      announce(dragged.querySelector(".bx-kcard__title").textContent + " moved to " + colName(dragged));
    });
    board.addEventListener("dragend", function () {
      if (dragged) dragged.classList.remove("is-ghost");
      if (slot.parentNode) slot.remove();
      dragged = null;
      wip(board);
    });
    /* Keyboard parity: Alt+Arrow moves the focused card between columns
       (left/right) or within one (up/down). */
    board.addEventListener("keydown", function (e) {
      var card = e.target.closest(".bx-kcard");
      if (!card || !e.altKey) return;
      var cols = [].slice.call(board.querySelectorAll(".bx-kanban__list"));
      var list = card.parentNode, ci = cols.indexOf(list);
      if (e.key === "ArrowRight" && cols[ci + 1]) cols[ci + 1].appendChild(card);
      else if (e.key === "ArrowLeft" && cols[ci - 1]) cols[ci - 1].appendChild(card);
      else if (e.key === "ArrowUp" && card.previousElementSibling) list.insertBefore(card, card.previousElementSibling);
      else if (e.key === "ArrowDown" && card.nextElementSibling) list.insertBefore(card.nextElementSibling, card);
      else return;
      e.preventDefault();
      card.focus();
      wip(board);
      announce(card.querySelector(".bx-kcard__title").textContent + " in " + colName(card) + ", position " + ([].indexOf.call(card.parentNode.children, card) + 1));
    });
    wip(board);
  });
  function colName(card) { return card.closest(".bx-kanban__col").querySelector(".bx-kanban__head .bx-label").textContent; }

  /* ------------------------------------------------------------- panes */

  each(".bx-resizer", function (r) {
    var vertical = r.parentNode.classList.contains("bx-panes--v");
    var pane = r.previousElementSibling;
    var min = +(r.getAttribute("data-min") || 120), max = +(r.getAttribute("data-max") || 600);
    var start = pane.getBoundingClientRect()[vertical ? "height" : "width"];
    function set(px) {
      px = Math.round(Math.max(min, Math.min(max, px)));
      pane.style.flex = "0 0 " + px + "px";
      r.setAttribute("aria-valuenow", px);
    }
    r.setAttribute("aria-valuemin", min);
    r.setAttribute("aria-valuemax", max);
    set(start);
    r.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      r.setPointerCapture(e.pointerId);
      r.classList.add("is-dragging");
      var from = vertical ? e.clientY : e.clientX, size = pane.getBoundingClientRect()[vertical ? "height" : "width"];
      function move(ev) { set(size + (vertical ? ev.clientY : ev.clientX) - from); }
      function up() { r.classList.remove("is-dragging"); r.removeEventListener("pointermove", move); r.removeEventListener("pointerup", up); }
      r.addEventListener("pointermove", move);
      r.addEventListener("pointerup", up);
    });
    r.addEventListener("dblclick", function () { set(start); });
    r.addEventListener("keydown", function (e) {
      var cur = +r.getAttribute("aria-valuenow"), step = e.shiftKey ? 64 : 16;
      var dec = vertical ? "ArrowUp" : "ArrowLeft", inc = vertical ? "ArrowDown" : "ArrowRight";
      if (e.key === dec) set(cur - step);
      else if (e.key === inc) set(cur + step);
      else if (e.key === "Home") set(min);
      else if (e.key === "End") set(max);
      else if (e.key === "Enter") set(start);
      else return;
      e.preventDefault();
    });
  });

  /* ------------------------------------------------- editable data grid */

  each(".bx-grid-edit", function (grid) {
    var cells = function () { return [].slice.call(grid.querySelectorAll("tbody tr")).map(function (tr) { return [].slice.call(tr.querySelectorAll("td")); }); };
    var bar = document.getElementById(grid.getAttribute("data-bar") || "");
    function pos(td) {
      var m = cells();
      for (var r = 0; r < m.length; r++) { var c = m[r].indexOf(td); if (c > -1) return [r, c]; }
      return [0, 0];
    }
    function go(r, c) {
      var m = cells();
      r = Math.max(0, Math.min(m.length - 1, r));
      c = Math.max(0, Math.min(m[r].length - 1, c));
      each("td[tabindex='0']", function (x) { x.tabIndex = -1; }, grid);
      m[r][c].tabIndex = 0;
      m[r][c].focus();
    }
    function dirty() {
      var n = grid.querySelectorAll("td[data-dirty]").length;
      var bad = grid.querySelectorAll("td[aria-invalid='true']").length;
      if (!bar) return;
      bar.querySelector("[data-grid-status]").textContent = n ? n + (n === 1 ? " unsaved change" : " unsaved changes") + (bad ? " · " + bad + " invalid" : "") : "All changes saved";
      each("button", function (b) { b.disabled = !n || (b.hasAttribute("data-grid-save") && bad > 0); }, bar);
    }
    function edit(td, seed) {
      if (td.getAttribute("aria-readonly") === "true" || td.classList.contains("is-editing")) return;
      var was = td.getAttribute("data-orig") != null ? td.getAttribute("data-orig") : td.textContent;
      td.setAttribute("data-orig", was);
      var inp = el("input");
      inp.value = seed != null ? seed : td.textContent;
      inp.setAttribute("aria-label", grid.querySelectorAll("thead th")[td.cellIndex].textContent + ", row " + (pos(td)[0] + 1));
      td.textContent = "";
      td.classList.add("is-editing");
      td.appendChild(inp);
      inp.focus();
      if (seed == null) inp.select();
      function done(commit, dr, dc) {
        if (!td.classList.contains("is-editing")) return;
        var v = commit ? inp.value.trim() : (td.getAttribute("data-last") || td.getAttribute("data-orig"));
        td.classList.remove("is-editing");
        td.textContent = v;
        if (commit) td.setAttribute("data-last", v);
        td.toggleAttribute("data-dirty", v !== td.getAttribute("data-orig"));
        var rule = td.getAttribute("data-validate");
        var ok = !rule || new RegExp(rule).test(v);
        td.setAttribute("aria-invalid", String(!ok));
        if (!ok) td.title = td.getAttribute("data-error") || "Invalid value"; else td.removeAttribute("title");
        dirty();
        var p = pos(td);
        go(p[0] + (dr || 0), p[1] + (dc || 0));
      }
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); done(true, 1, 0); }
        else if (e.key === "Tab") { e.preventDefault(); done(true, 0, e.shiftKey ? -1 : 1); }
        else if (e.key === "Escape") { e.preventDefault(); done(false); }
        e.stopPropagation();
      });
      inp.addEventListener("blur", function () { done(true); });
    }
    grid.addEventListener("keydown", function (e) {
      var td = e.target.closest("td");
      if (!td || td.classList.contains("is-editing")) return;
      var p = pos(td);
      var mv = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      if (mv) { e.preventDefault(); go(p[0] + mv[0], p[1] + mv[1]); }
      else if (e.key === "Enter" || e.key === "F2") { e.preventDefault(); edit(td); }
      else if (e.key === "Tab") { /* leave the grid */ }
      else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); edit(td, ""); }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { e.preventDefault(); edit(td, e.key); }
    });
    grid.addEventListener("click", function (e) { var td = e.target.closest("td"); if (td && !td.classList.contains("is-editing")) { var p = pos(td); go(p[0], p[1]); } });
    grid.addEventListener("dblclick", function (e) { var td = e.target.closest("td"); if (td) edit(td); });
    if (bar) bar.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      each("td[data-dirty], td[aria-invalid='true']", function (td) {
        if (b.hasAttribute("data-grid-discard")) td.textContent = td.getAttribute("data-orig");
        else td.setAttribute("data-orig", td.textContent);
        td.removeAttribute("data-dirty"); td.removeAttribute("data-last"); td.setAttribute("aria-invalid", "false"); td.removeAttribute("title");
      }, grid);
      dirty();
      say(b.hasAttribute("data-grid-discard") ? "Changes discarded" : "Changes saved");
    });
    var first = grid.querySelector("tbody td");
    if (first) first.tabIndex = 0;
    each("tbody td", function (td) { if (td !== first) td.tabIndex = -1; }, grid);
    dirty();
  });

  /* ------------------------------------------------------ colour picker */

  function hsvToRgb(h, s, v) {
    var f = function (n) { var k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
    return [f(5), f(3), f(1)].map(function (x) { return Math.round(x * 255); });
  }
  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, h = 0;
    if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, max ? d / max : 0, max];
  }
  var toHex = function (rgb) { return "#" + rgb.map(function (x) { return x.toString(16).padStart(2, "0"); }).join("").toUpperCase(); };
  var fromHex = function (h) { var m = /^#?([0-9a-f]{6})$/i.exec(h.trim()); return m ? [0, 2, 4].map(function (i) { return parseInt(m[1].substr(i, 2), 16); }) : null; };
  function relLum(rgb) {
    var c = rgb.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  each(".bx-picker", function (pk) {
    var sv = pk.querySelector(".bx-picker__sv"), thumb = pk.querySelector(".bx-picker__thumb");
    var hue = pk.querySelector(".bx-picker__hue"), hex = pk.querySelector(".bx-picker__hex");
    var out = document.getElementById(pk.getAttribute("data-swatch") || "");
    var ratio = pk.querySelector("[data-ratio]"), grade = pk.querySelector("[data-grade]");
    var st = rgbToHsv.apply(null, fromHex(hex.value) || [15, 98, 254]);
    function paint(from) {
      var rgb = hsvToRgb(st[0], st[1], st[2]), h = toHex(rgb);
      sv.style.setProperty("--h", Math.round(st[0]));
      thumb.style.left = (st[1] * 100) + "%";
      thumb.style.top = ((1 - st[2]) * 100) + "%";
      sv.setAttribute("aria-valuetext", "saturation " + Math.round(st[1] * 100) + "%, brightness " + Math.round(st[2] * 100) + "%");
      if (from !== "hue") { hue.value = Math.round(st[0]); }
      hue.style.setProperty("--val", (st[0] / 360 * 100) + "%");
      if (from !== "hex") hex.value = h;
      if (out) { out.style.setProperty("--c", h); var t = out.parentNode.querySelector("[data-hex]"); if (t) t.textContent = h; }
      /* Contrast against the canvas the colour will actually sit on. */
      var bg = getComputedStyle(document.body).backgroundColor.match(/\d+/g).slice(0, 3).map(Number);
      var l1 = relLum(rgb), l2 = relLum(bg), r = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      if (ratio) ratio.textContent = r.toFixed(2) + ":1";
      if (grade) { grade.textContent = r >= 4.5 ? "AA text" : r >= 3 ? "AA large / UI" : "Decorative only"; grade.className = "bx-tag bx-tag--sm " + (r >= 4.5 ? "bx-tag--success" : r >= 3 ? "bx-tag--warning" : "bx-tag--danger"); }
      each(".bx-picker__swatches button", function (b) { b.setAttribute("aria-pressed", String((b.getAttribute("data-hex") || "").toUpperCase() === h)); }, pk);
    }
    function fromPoint(e) {
      var r = sv.getBoundingClientRect();
      st[1] = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      st[2] = 1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      paint();
    }
    sv.addEventListener("pointerdown", function (e) {
      sv.setPointerCapture(e.pointerId); fromPoint(e); sv.focus();
      var mv = function (ev) { fromPoint(ev); };
      sv.addEventListener("pointermove", mv);
      sv.addEventListener("pointerup", function up() { sv.removeEventListener("pointermove", mv); sv.removeEventListener("pointerup", up); });
    });
    sv.addEventListener("keydown", function (e) {
      var d = e.shiftKey ? 0.1 : 0.01;
      if (e.key === "ArrowLeft") st[1] = Math.max(0, st[1] - d);
      else if (e.key === "ArrowRight") st[1] = Math.min(1, st[1] + d);
      else if (e.key === "ArrowUp") st[2] = Math.min(1, st[2] + d);
      else if (e.key === "ArrowDown") st[2] = Math.max(0, st[2] - d);
      else return;
      e.preventDefault(); paint();
    });
    hue.addEventListener("input", function () { st[0] = +hue.value; paint("hue"); });
    hex.addEventListener("input", function () { var rgb = fromHex(hex.value); if (rgb) { st = rgbToHsv.apply(null, rgb); paint("hex"); } });
    hex.addEventListener("blur", function () { paint(); });
    pk.addEventListener("click", function (e) {
      var b = e.target.closest(".bx-picker__swatches button");
      if (b) { st = rgbToHsv.apply(null, fromHex(b.getAttribute("data-hex"))); paint(); return; }
      if (e.target.closest("[data-eyedropper]") && window.EyeDropper) {
        new window.EyeDropper().open().then(function (r) { st = rgbToHsv.apply(null, fromHex(r.sRGBHex)); paint(); }, function () {});
      }
    });
    var eye = pk.querySelector("[data-eyedropper]");
    if (eye && !window.EyeDropper) eye.hidden = true;
    paint();
  });

  /* -------------------------------------------------------------- inbox */

  each(".bx-inbox", function (box) {
    var badge = document.getElementById(box.getAttribute("data-badge") || "");
    function sync() {
      var n = box.querySelectorAll(".bx-note[data-unread]").length;
      if (badge) { badge.textContent = n > 9 ? "9+" : n; badge.hidden = !n; }
      var trig = document.querySelector('[popovertarget="' + box.id + '"]');
      if (trig) trig.setAttribute("aria-label", "Notifications, " + n + " unread");
      var c = box.querySelector("[data-unread-count]");
      if (c) c.textContent = n ? n + " unread" : "All caught up";
    }
    box.addEventListener("click", function (e) {
      if (e.target.closest("[data-mark-all]")) { each(".bx-note[data-unread]", function (n) { n.removeAttribute("data-unread"); }, box); sync(); return; }
      var act = e.target.closest(".bx-note__actions button");
      var note = e.target.closest(".bx-note");
      if (note) note.removeAttribute("data-unread");
      if (act) { say(act.textContent.trim(), note.querySelector(".bx-note__text").textContent.trim()); act.closest(".bx-note__actions").remove(); }
      sync();
    });
    box.addEventListener("keydown", function (e) {
      var note = e.target.closest(".bx-note");
      if (note && (e.key === "Enter" || e.key === " ") && e.target === note) { e.preventDefault(); note.click(); }
    });
    /* The filter tabs narrow the list in place. */
    box.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-inbox-filter]");
      if (!tab) return;
      var f = tab.getAttribute("data-inbox-filter");
      each("[data-inbox-filter]", function (t) { t.setAttribute("aria-selected", String(t === tab)); }, box);
      each(".bx-note", function (n) {
        n.hidden = (f === "unread" && !n.hasAttribute("data-unread")) || (f === "mentions" && !n.hasAttribute("data-mention"));
      }, box);
    });
    sync();
  });

  paint();
})();
