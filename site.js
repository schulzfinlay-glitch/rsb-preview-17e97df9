// RSB Building: string line progress, Peg it out, the enquiry.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);

  /* the string line: a yellow bead travels along it as you go down the page */
  var you = $('[data-you]');
  var bar = $('.bar');
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    if (you) bar.style.setProperty('--you', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
  var links = $$('.bar nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; links.forEach(function (a) { a.classList.toggle('on', a.hash === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['direct', 'work', 'peg', 'call'].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- Peg it out ---------- */
  var svg = $('[data-plan-svg]');
  var setoutText = '';
  if (svg) {
    var NS = 'http://www.w3.org/2000/svg';
    var S = 10, OX = 20, OY = 20, W = 60, H = 40, MIN = 3, EXT = 1.6;
    var b = { x1: 10, y1: 10, x2: 34, y2: 25 };
    var g = $('[data-build]', svg);
    var form = $('[data-peg-form]');
    var inW = $('[data-w]'), inL = $('[data-l]');
    var names = { nw: 'Top-left', ne: 'Top-right', se: 'Bottom-right', sw: 'Bottom-left' };
    var snap = function (v) { return Math.round(v * 2) / 2; };
    var fmt = function (v) { return (Math.round(v * 10) / 10).toString(); };
    var el = function (tag, attrs, parent) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); (parent || g).appendChild(n); return n; };
    var X = function (m) { return OX + m * S; }, Y = function (m) { return OY + m * S; };

    // static drawing, updated in place
    var rect = el('rect', { class: 'bld' });
    var strings = [0, 1, 2, 3].map(function () { return el('line', { class: 'strg' }); });
    var tTop = el('text', { class: 'dimt', 'text-anchor': 'middle' });
    var tSide = el('text', { class: 'dimt', 'text-anchor': 'middle' });
    var tArea = el('text', { class: 'dimt dimt--area', 'text-anchor': 'middle' });
    var pegs = {};
    ['nw', 'ne', 'se', 'sw'].forEach(function (k) {
      var p = el('g', { class: 'pegh', tabindex: '0', role: 'button', 'aria-roledescription': 'draggable peg', 'data-k': k });
      el('circle', { class: 'hit', r: 30 }, p); el('circle', { class: 'ring', r: 16 }, p); el('circle', { class: 'head', r: 9 }, p);
      el('path', { class: 'cross', d: 'M-5 0H5M0 -5V5' }, p);
      pegs[k] = p;
    });
    var corner = function (k) { return { x: k.indexOf('w') > -1 ? 'x1' : 'x2', y: k.indexOf('n') > -1 ? 'y1' : 'y2' }; };

    function storeys() { var c = $('input[name=storeys]:checked', form); return c ? +c.value : 1; }
    function kind() { var c = $('input[name=kind]:checked', form); return c ? c.value : ''; }
    function render(fromInput) {
      var w = b.x2 - b.x1, l = b.y2 - b.y1, a = w * l, st = storeys();
      rect.setAttribute('x', X(b.x1)); rect.setAttribute('y', Y(b.y1)); rect.setAttribute('width', w * S); rect.setAttribute('height', l * S);
      var L = [[b.x1 - EXT, b.y1, b.x2 + EXT, b.y1], [b.x1 - EXT, b.y2, b.x2 + EXT, b.y2], [b.x1, b.y1 - EXT, b.x1, b.y2 + EXT], [b.x2, b.y1 - EXT, b.x2, b.y2 + EXT]];
      strings.forEach(function (s, i) { s.setAttribute('x1', X(L[i][0])); s.setAttribute('y1', Y(L[i][1])); s.setAttribute('x2', X(L[i][2])); s.setAttribute('y2', Y(L[i][3])); });
      tTop.setAttribute('x', X((b.x1 + b.x2) / 2)); tTop.setAttribute('y', Y(b.y1) - 9); tTop.textContent = fmt(w) + ' m';
      var sx = X(b.x2) + 30, sy = Y((b.y1 + b.y2) / 2);
      if (sx > OX + W * S - 10) sx = X(b.x1) - 30;
      tSide.setAttribute('x', sx); tSide.setAttribute('y', sy); tSide.setAttribute('transform', 'rotate(-90 ' + sx + ' ' + sy + ')'); tSide.textContent = fmt(l) + ' m';
      tArea.setAttribute('x', X((b.x1 + b.x2) / 2)); tArea.setAttribute('y', Y((b.y1 + b.y2) / 2) + 7); tArea.textContent = w * l >= 30 ? fmt(a) + ' m²' : '';
      Object.keys(pegs).forEach(function (k) {
        var c = corner(k), px = b[c.x], py = b[c.y];
        pegs[k].setAttribute('transform', 'translate(' + X(px) + ' ' + Y(py) + ')');
        pegs[k].setAttribute('aria-label', names[k] + ' peg at ' + fmt(px) + ' m across, ' + fmt(py) + ' m down. Arrow keys move it half a metre, Shift for 5 m.');
      });
      $('[data-area]').textContent = fmt(a);
      var floor = st > 1 ? ' · ' + fmt(a * st) + ' m² over ' + st + ' storeys' : ' · 1 storey';
      $('[data-dims]').textContent = fmt(w) + ' m × ' + fmt(l) + ' m footprint' + floor;
      $('[data-perim]').textContent = fmt(2 * (w + l));
      if (!fromInput) { inW.value = fmt(w); inL.value = fmt(l); }
      setoutText = fmt(w) + ' m × ' + fmt(l) + ' m (' + fmt(a) + ' m² footprint), ' + st + (st > 1 ? ' storeys' : ' storey') + ', ' + kind();
    }
    function moveCorner(k, mx, my) {
      var c = corner(k);
      mx = snap(Math.max(0, Math.min(W, mx))); my = snap(Math.max(0, Math.min(H, my)));
      if (c.x === 'x1') b.x1 = Math.min(mx, b.x2 - MIN); else b.x2 = Math.max(mx, b.x1 + MIN);
      if (c.y === 'y1') b.y1 = Math.min(my, b.y2 - MIN); else b.y2 = Math.max(my, b.y1 + MIN);
      render();
    }
    function toPlan(e) {
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { x: (p.x - OX) / S, y: (p.y - OY) / S };
    }
    var dragK = null;
    svg.addEventListener('pointerdown', function (e) {
      var p = e.target.closest('.pegh'); if (!p) return;
      dragK = p.getAttribute('data-k'); p.classList.add('drag'); svg.setPointerCapture(e.pointerId); e.preventDefault();
    });
    svg.addEventListener('pointermove', function (e) { if (!dragK) return; var m = toPlan(e); moveCorner(dragK, m.x, m.y); });
    var end = function () { if (dragK) pegs[dragK].classList.remove('drag'); dragK = null; };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    svg.addEventListener('keydown', function (e) {
      var p = e.target.closest('.pegh'); if (!p) return;
      var k = p.getAttribute('data-k'), c = corner(k), step = e.shiftKey ? 5 : 0.5;
      var d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (!d) return; e.preventDefault(); moveCorner(k, b[c.x] + d[0], b[c.y] + d[1]);
    });
    function fromInputs() {
      var w = parseFloat(inW.value), l = parseFloat(inL.value);
      if (w >= MIN) { w = Math.min(W, w); if (b.x1 + w > W) b.x1 = W - w; b.x2 = b.x1 + w; }
      if (l >= MIN) { l = Math.min(H, l); if (b.y1 + l > H) b.y1 = H - l; b.y2 = b.y1 + l; }
      render(true);
    }
    inW.addEventListener('input', fromInputs); inL.addEventListener('input', fromInputs);
    inW.addEventListener('change', function () { render(); }); inL.addEventListener('change', function () { render(); });
    form.addEventListener('change', function (e) { if (e.target.name === 'kind' || e.target.name === 'storeys') render(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $('[data-send]').addEventListener('click', function () {
      var f = $('[data-setout]'); if (f) f.value = setoutText;
      try { sessionStorage.setItem('rsb-setout', setoutText); } catch (err) {}
    });
    render();
    // invitation: the far peg walks out once when the plan is first seen
    if (!reduce && 'IntersectionObserver' in window) {
      var seen = false;
      new IntersectionObserver(function (es, o) {
        if (!es[0].isIntersecting || seen) return; seen = true; o.disconnect();
        var from = { x: b.x2, y: b.y2 }, to = { x: 40, y: 28 }, t0 = performance.now();
        b.x2 = 20; b.y2 = 18; render();
        (function step(t) { var k = Math.min(1, (t - t0) / 1100), q = 1 - Math.pow(1 - k, 3); if (!dragK) { b.x2 = snap(20 + (to.x - 20) * q); b.y2 = snap(18 + (to.y - 18) * q); render(); } if (k < 1) requestAnimationFrame(step); })(t0);
      }, { threshold: 0.5 }).observe(svg);
    }
  }

  /* ---------- the enquiry ---------- */
  var enq = $('[data-enquiry]');
  if (enq) {
    try { var saved = sessionStorage.getItem('rsb-setout'); if (saved && !$('[data-setout]').value) $('[data-setout]').value = saved; } catch (err) {}
    var err = $('[data-err]', enq);
    enq.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(enq);
      if (f.get('website')) return;
      var name = (f.get('name') || '').trim(), phone = (f.get('phone') || '').trim(), email = (f.get('email') || '').trim();
      var msg = !name ? 'Please add your name.' : (!phone && !email) ? 'Please add a phone number or an email so Ryan can reply.' : (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) ? 'That email address looks incomplete.' : '';
      err.textContent = msg;
      if (msg) { (!name ? enq.elements.name : enq.elements.phone).focus(); return; }
      var data = { setout: f.get('setout'), job: f.get('job'), name: name, business: f.get('business'), phone: phone, email: email };
      var cfg = window.RSB_ENQUIRY || {};
      var done = $('[data-done]', enq);
      var show = function (sent) {
        done.hidden = false;
        done.innerHTML = '<h4>' + (sent ? 'Sent to Ryan.' : 'Demo: not sent.') + '</h4><p>' + (sent ? "Thanks. Ryan will be in touch." : 'This preview is not connected yet, so nothing was sent. To start now, call Ryan on <a href="tel:+61402944615">0402 944 615</a>.') + '</p>';
        done.focus();
      };
      if (!cfg.endpoint) { show(false); return; }
      fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; show(true); })
        .catch(function () { err.textContent = "That didn't send. Please call Ryan on 0402 944 615."; });
    });
  }
})();
