// RSB Building: section links, gallery filter and lightbox, Size it up, the enquiry.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);

  /* header: underline the section you're in */
  var links = $$('.tb__nav a');
  if ('IntersectionObserver' in window && links.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.hash === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'work', 'plan', 'contact'].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* gallery: filter in place, open a photo large */
  $$('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      $$('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.gallery .ph').forEach(function (li) { li.hidden = !(f === 'all' || li.getAttribute('data-stage') === f); });
    });
  });
  var lb = $('[data-lb]');
  if (lb && lb.showModal) {
    $$('.ph__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        $('[data-lb-img]', lb).src = b.getAttribute('data-full');
        $('[data-lb-img]', lb).alt = b.getAttribute('data-cap');
        $('[data-lb-cap]', lb).textContent = b.getAttribute('data-cap');
        lb.showModal();
      });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  /* ---------- Size it up: a dimensioned plan you drag ---------- */
  var svg = $('[data-plan-svg]');
  var setoutText = '';
  if (svg) {
    var NS = 'http://www.w3.org/2000/svg';
    var S = 10, OX = 20, OY = 20, W = 60, H = 40, MIN = 3;
    var b = { x1: 12, y1: 11, x2: 42, y2: 29 };
    var g = $('[data-build]', svg);
    var form = $('[data-peg-form]');
    var inW = $('[data-w]'), inL = $('[data-l]');
    var names = { nw: 'Top-left', ne: 'Top-right', se: 'Bottom-right', sw: 'Bottom-left' };
    var snap = function (v) { return Math.round(v * 2) / 2; };
    var fmt = function (v) { return (Math.round(v * 10) / 10).toString(); };
    var el = function (tag, attrs, parent) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); (parent || g).appendChild(n); return n; };
    var X = function (m) { return OX + m * S; }, Y = function (m) { return OY + m * S; };
    var set = function (n, a) { for (var k in a) n.setAttribute(k, a[k]); };

    var rect = el('rect', { class: 'bld' });
    // horizontal dimension (above) and vertical dimension (right or left)
    var hd = { e1: el('line', { class: 'ext' }), e2: el('line', { class: 'ext' }), l: el('line', { class: 'dimline' }), t1: el('line', { class: 'tick' }), t2: el('line', { class: 'tick' }), txt: el('text', { class: 'dimt', 'text-anchor': 'middle' }) };
    var vd = { e1: el('line', { class: 'ext' }), e2: el('line', { class: 'ext' }), l: el('line', { class: 'dimline' }), t1: el('line', { class: 'tick' }), t2: el('line', { class: 'tick' }), txt: el('text', { class: 'dimt', 'text-anchor': 'middle' }) };
    var tArea = el('text', { class: 'dimt dimt--area', 'text-anchor': 'middle' });
    var pegs = {};
    ['nw', 'ne', 'se', 'sw'].forEach(function (k) {
      var p = el('g', { class: 'pegh', tabindex: '0', role: 'button', 'aria-roledescription': 'draggable corner', 'data-k': k });
      el('circle', { class: 'hit', r: 30 }, p); el('circle', { class: 'ring', r: 15 }, p); el('circle', { class: 'head', r: 8 }, p); el('circle', { class: 'dot', r: 2 }, p);
      pegs[k] = p;
    });
    var corner = function (k) { return { x: k.indexOf('w') > -1 ? 'x1' : 'x2', y: k.indexOf('n') > -1 ? 'y1' : 'y2' }; };
    function storeys() { var c = $('input[name=storeys]:checked', form); return c ? +c.value : 1; }
    function kind() { var c = $('input[name=kind]:checked', form); return c ? c.value : ''; }

    function render(fromInput) {
      var w = b.x2 - b.x1, l = b.y2 - b.y1, a = w * l, st = storeys();
      set(rect, { x: X(b.x1), y: Y(b.y1), width: w * S, height: l * S });
      // horizontal dimension string, 24px above the top edge
      var hy = Y(b.y1) - 24;
      set(hd.e1, { x1: X(b.x1), y1: Y(b.y1) - 6, x2: X(b.x1), y2: hy - 6 }); set(hd.e2, { x1: X(b.x2), y1: Y(b.y1) - 6, x2: X(b.x2), y2: hy - 6 });
      set(hd.l, { x1: X(b.x1) - 8, y1: hy, x2: X(b.x2) + 8, y2: hy });
      set(hd.t1, { x1: X(b.x1) - 5, y1: hy + 5, x2: X(b.x1) + 5, y2: hy - 5 }); set(hd.t2, { x1: X(b.x2) - 5, y1: hy + 5, x2: X(b.x2) + 5, y2: hy - 5 });
      set(hd.txt, { x: X((b.x1 + b.x2) / 2), y: hy - 7 }); hd.txt.textContent = fmt(w) + ' m';
      // vertical dimension string, right of the building (left if there's no room)
      var right = X(b.x2) + 40 < OX + W * S, vx = right ? X(b.x2) + 24 : X(b.x1) - 24, off = right ? 6 : -6;
      set(vd.e1, { x1: (right ? X(b.x2) : X(b.x1)) + off, y1: Y(b.y1), x2: vx + off, y2: Y(b.y1) }); set(vd.e2, { x1: (right ? X(b.x2) : X(b.x1)) + off, y1: Y(b.y2), x2: vx + off, y2: Y(b.y2) });
      set(vd.l, { x1: vx, y1: Y(b.y1) - 8, x2: vx, y2: Y(b.y2) + 8 });
      set(vd.t1, { x1: vx - 5, y1: Y(b.y1) + 5, x2: vx + 5, y2: Y(b.y1) - 5 }); set(vd.t2, { x1: vx - 5, y1: Y(b.y2) + 5, x2: vx + 5, y2: Y(b.y2) - 5 });
      var ty = Y((b.y1 + b.y2) / 2), tx = vx + (right ? 15 : -8);
      set(vd.txt, { x: tx, y: ty, transform: 'rotate(-90 ' + tx + ' ' + ty + ')' }); vd.txt.textContent = fmt(l) + ' m';
      set(tArea, { x: X((b.x1 + b.x2) / 2), y: Y((b.y1 + b.y2) / 2) + 8 }); tArea.textContent = a >= 40 ? fmt(a) + ' m²' : '';
      Object.keys(pegs).forEach(function (k) {
        var c = corner(k), px = b[c.x], py = b[c.y];
        pegs[k].setAttribute('transform', 'translate(' + X(px) + ' ' + Y(py) + ')');
        pegs[k].setAttribute('aria-label', names[k] + ' corner at ' + fmt(px) + ' m across, ' + fmt(py) + ' m down. Arrow keys move it half a metre, Shift for 5 m.');
      });
      $('[data-area]').textContent = fmt(a);
      $('[data-dims]').textContent = fmt(w) + ' m × ' + fmt(l) + ' m footprint' + (st > 1 ? ' · ' + fmt(a * st) + ' m² over ' + st + ' storeys' : ' · single storey');
      $('[data-perim]').textContent = fmt(2 * (w + l));
      if (!fromInput) { inW.value = fmt(w); inL.value = fmt(l); }
      setoutText = kind() + ', ' + fmt(w) + ' m × ' + fmt(l) + ' m (' + fmt(a) + ' m² footprint), ' + (st > 1 ? st + ' storeys' : 'single storey');
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
    svg.addEventListener('pointermove', function (e) { if (dragK) { var m = toPlan(e); moveCorner(dragK, m.x, m.y); } });
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
      $('[data-setout]').value = setoutText; $('[data-tb-project]').textContent = setoutText;
      try { sessionStorage.setItem('rsb-setout', setoutText); } catch (err) {}
    });
    render();
    // invitation: the far corner eases out once, the first time the plan is seen
    if (!reduce && 'IntersectionObserver' in window) {
      var seen = false;
      new IntersectionObserver(function (es, o) {
        if (!es[0].isIntersecting || seen) return; seen = true; o.disconnect();
        var t0 = performance.now(), fx = 24, fy = 20, tx = 42, ty = 29;
        b.x2 = fx; b.y2 = fy; render();
        (function step(t) { var k = Math.min(1, (t - t0) / 1200), q = 1 - Math.pow(1 - k, 3); if (!dragK) { b.x2 = snap(fx + (tx - fx) * q); b.y2 = snap(fy + (ty - fy) * q); render(); } if (k < 1) requestAnimationFrame(step); })(t0);
      }, { threshold: 0.5 }).observe(svg);
    }
  }

  /* ---------- the enquiry ---------- */
  var enq = $('[data-enquiry]');
  if (enq) {
    try { var saved = sessionStorage.getItem('rsb-setout'); if (saved) { $('[data-setout]').value = saved; $('[data-tb-project]').textContent = saved; } } catch (err) {}
    var err = $('[data-err]', enq);
    enq.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(enq);
      if (f.get('website')) return;
      var name = (f.get('name') || '').trim(), phone = (f.get('phone') || '').trim(), email = (f.get('email') || '').trim();
      var msg = !name ? 'Please add your name.' : (!phone && !email) ? 'Please add a phone number or an email so Ryan can reply.' : (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) ? 'That email address looks incomplete.' : '';
      err.textContent = msg;
      if (msg) { (!name ? enq.elements.name : enq.elements.phone).focus(); return; }
      var data = { project: f.get('setout'), about: f.get('job'), name: name, business: f.get('business'), phone: phone, email: email };
      var cfg = window.RSB_ENQUIRY || {};
      var done = $('[data-done]', enq);
      var show = function (sent) {
        done.hidden = false;
        done.innerHTML = '<h4>' + (sent ? 'Sent to Ryan.' : 'Preview only: not sent.') + '</h4><p>' + (sent ? 'Thanks. Ryan will be in touch.' : 'This preview is not connected yet, so nothing was sent. Call Ryan on <a href="tel:+61402944615">0402 944 615</a>.') + '</p>';
        done.focus();
      };
      if (!cfg.endpoint) { show(false); return; }
      fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw 0; show(true); })
        .catch(function () { err.textContent = "That didn't send. Please call Ryan on 0402 944 615."; });
    });
  }
})();
