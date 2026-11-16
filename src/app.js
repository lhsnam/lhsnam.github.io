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
})();
