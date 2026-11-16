(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  function paint() { if (btn) btn.textContent = root.dataset.theme === 'dark' ? '☀' : '☾'; }
  paint();
  if (btn) btn.addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    paint();
  });
  // Assemble email address at runtime to keep it out of plain HTML.
  document.querySelectorAll('a[data-u]').forEach(function (a) {
    a.href = 'mailto:' + a.dataset.u + '@' + a.dataset.d;
  });
  // Remember language choice for the root redirect.
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () { try { localStorage.setItem('lang', a.getAttribute('hreflang')); } catch (e) {} });
  });

  // ---------- scroll experience ----------
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fx = root.classList.contains('fx');
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };

  // reveal-once for figures and blocks
  var rv = document.querySelectorAll('.rv');
  if (fx && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  // DNA scroll bar (over/under helix)
  var host = document.getElementById('dna');
  var svg = host && host.querySelector('svg');
  var label = host && host.querySelector('.nm');
  var hero = document.getElementById('hero');
  var tl = document.querySelector('.tl');
  var jobs = tl ? Array.prototype.slice.call(tl.querySelectorAll('.job')) : [];
  var secs = Array.prototype.slice.call(document.querySelectorAll('main section.blk'));
  var names = secs.map(function (s) { var h = s.querySelector('h2'); return h ? h.textContent.trim() : ''; });
  var pageName = (document.querySelector('main h1') || {}).textContent || host && host.dataset.top || '';
  var ticking = false;

  function helix(H, W, phase) {
    var CX = W / 2, A = W * 0.32, L = 70, gap = 5, d1 = '', d2 = '', p1 = false, p2 = false;
    for (var y = 0; y <= H; y += 2) {
      var ph = 2 * Math.PI * y / L + phase, k = Math.round(ph / Math.PI);
      var dist = Math.abs(ph - k * Math.PI) * L / (2 * Math.PI), brk = dist < gap, even = ((k % 2) + 2) % 2 === 0;
      var sn = Math.sin(ph);
      if (brk && even) p1 = false; else { d1 += (p1 ? 'L' : 'M') + (CX + A * sn).toFixed(1) + ' ' + y; p1 = true; }
      if (brk && !even) p2 = false; else { d2 += (p2 ? 'L' : 'M') + (CX - A * sn).toFixed(1) + ' ' + y; p2 = true; }
    }
    return d1 + d2;
  }

  function update() {
    ticking = false;
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - innerHeight), p = clamp(scrollY / max);


    if (tl && fx) {
      var r = tl.getBoundingClientRect(), f = clamp((innerHeight * 0.62 - r.top) / r.height);
      tl.style.setProperty('--tlp', f.toFixed(3));
      jobs.forEach(function (j) { j.classList.toggle('lit', j.offsetTop + 12 <= f * r.height); });
    }

    if (host && svg) {
      var H = host.clientHeight, W = host.clientWidth, y = p * H, d = helix(H, W, reduce ? 0 : p * Math.PI * 8);
      var thumbY = Math.min(H - 6, Math.max(6, y));
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.innerHTML = '<defs><clipPath id="dna-a"><rect x="-4" y="0" width="' + (W + 8) + '" height="' + y.toFixed(1) + '"/></clipPath></defs>' +
        '<path d="' + d + '" fill="none" stroke-width="1.4" stroke-linecap="round" style="stroke:var(--ghost)"/>' +
        '<path d="' + d + '" fill="none" stroke-width="1.6" stroke-linecap="round" clip-path="url(#dna-a)" style="stroke:var(--ink)"/>' +
        '<circle cx="' + (W / 2) + '" cy="' + thumbY.toFixed(1) + '" r="7.5" style="fill:var(--paper)"/><circle cx="' + (W / 2) + '" cy="' + thumbY.toFixed(1) + '" r="4.2" style="fill:var(--red)"/>';
      var cur = -1;
      secs.forEach(function (s, i) { if (scrollY + innerHeight * 0.45 >= s.offsetTop) cur = i; });
      if (label) { label.textContent = cur >= 0 ? names[cur] : (secs.length ? host.dataset.top : pageName); label.style.top = thumbY.toFixed(1) + 'px'; }
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);

  if (host) {
    var drag = false;
    var scrub = function (e) {
      var rc = host.getBoundingClientRect(), f = clamp((e.clientY - rc.top) / rc.height);
      scrollTo({ top: f * (document.documentElement.scrollHeight - innerHeight), behavior: 'instant' });
    };
    host.addEventListener('pointerdown', function (e) { drag = true; host.setPointerCapture(e.pointerId); scrub(e); });
    host.addEventListener('pointermove', function (e) { if (drag) scrub(e); });
    host.addEventListener('pointerup', function () { drag = false; });
    host.addEventListener('pointercancel', function () { drag = false; });
  }
  update();
})();
