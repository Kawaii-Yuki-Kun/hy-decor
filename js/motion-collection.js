/* Collection page: motion, premium search / filters / pagination.
   Works alongside the inline collection script in index.html: that script
   still owns filtering (it sets [hidden] on .prod / .cgroup); this file runs
   after it on the same events and layers pagination (.mc-off) on top. */
(function () {
  var page = document.getElementById('collection');
  if (!page) return;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- decor + parallax hooks (set synchronously for the shared engine) ---- */
  var q = document.getElementById('q'), size = document.getElementById('size'), result = document.getElementById('result');
  var filters = page.querySelector('.filters'), tools = page.querySelector('.tools');
  var prods = [].slice.call(page.querySelectorAll('.cgroup .prod'));
  var groups = [].slice.call(page.querySelectorAll('.cgroup'));
  if (!q || !size || !result || !filters || !prods.length) { page.classList.add('mc-ready'); return; }
  page.classList.add('mc-ready');

  var PER = 12, cur = 1, pages = 1, prevShown = null;

  function el(tag, cls, html) { var x = document.createElement(tag); if (cls) x.className = cls; if (html) x.innerHTML = html; return x; }
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  /* ---- search: growing underline + clear button ---- */
  var sLabel = q.closest('.search');
  sLabel.appendChild(el('span', 'mc-uline'));
  var clr = el('button', 'mc-clear', X); clr.type = 'button'; clr.setAttribute('aria-label', 'Clear search');
  sLabel.appendChild(clr);
  function syncClear() { sLabel.classList.toggle('mc-has', !!q.value); }
  clr.addEventListener('click', function (e) {
    e.preventDefault(); q.value = ''; q.dispatchEvent(new Event('input', {bubbles: true})); q.focus();
  });
  q.addEventListener('keydown', function (e) { if (e.key === 'Escape' && q.value) { e.stopPropagation(); clr.click(); } });

  /* ---- height: segmented control mirroring the native select ---- */
  var segWrap = el('div', 'mc-seg-wrap'), lbl = el('span', 'mc-lbl'); lbl.id = 'mcSegLbl'; lbl.textContent = 'Height';
  var seg = el('div', 'mc-seg'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-labelledby', 'mcSegLbl');
  [].forEach.call(size.options, function (o) {
    var m = /^(.*?)\s*\((\d+)\)\s*$/.exec(o.textContent), b = el('button');
    b.type = 'button'; b.dataset.v = o.value;
    b.textContent = m ? m[1] : o.textContent;
    if (m) { var s = document.createElement('sup'); s.textContent = m[2]; b.appendChild(s); }
    seg.appendChild(b);
  });
  var segInd = el('span', 'mc-ind'); seg.appendChild(segInd);
  segWrap.appendChild(lbl); segWrap.appendChild(seg);
  size.closest('label').insertAdjacentElement('afterend', segWrap);
  seg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || size.value === b.dataset.v) return;
    size.value = b.dataset.v; size.dispatchEvent(new Event('change', {bubbles: true}));
  });

  /* ---- calm toolbar: Category + Height as two small menus (the original controls stay, hidden, and still do the filtering) ---- */
  var dds = el('div', 'mc-dds'), menus = [];
  function menu(key, items, curVal, pick) {
    var w = el('div', 'mc-dd'), b = el('button', 'mc-dd-b'), l = el('ul', 'mc-dd-l');
    b.type = 'button'; b.setAttribute('aria-haspopup', 'listbox'); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<span class="mc-dd-k">' + key + '</span><span class="mc-dd-v"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    l.setAttribute('role', 'listbox'); l.setAttribute('aria-label', key); l.hidden = true;
    items.forEach(function (it) {
      var li = el('li'), o = el('button', 'mc-dd-o'); o.type = 'button'; o.setAttribute('role', 'option'); o.dataset.v = it.v;
      o.innerHTML = '<span>' + it.t + '</span>' + (it.n != null ? '<em>' + it.n + '</em>' : '');
      o.addEventListener('click', function () { close(); if (curVal() !== it.v) pick(it.v); sync(); b.focus({preventScroll: true}); });
      li.appendChild(o); l.appendChild(li);
    });
    function open() { menus.forEach(function (m) { m.close(); }); l.hidden = false; requestAnimationFrame(function () { w.classList.add('open'); }); b.setAttribute('aria-expanded', 'true');
      var s = l.querySelector('[aria-selected="true"]') || l.querySelector('button'); if (s) s.focus({preventScroll: true}); }
    function close() { w.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); setTimeout(function () { if (!w.classList.contains('open')) l.hidden = true; }, 380); }
    function sync() { var v = curVal(), t = '';
      [].forEach.call(l.querySelectorAll('.mc-dd-o'), function (o) { var on = o.dataset.v === v; o.setAttribute('aria-selected', on ? 'true' : 'false'); if (on) t = o.firstChild.textContent; });
      b.querySelector('.mc-dd-v').textContent = t; w.classList.toggle('set', items.length && v !== items[0].v); }
    b.addEventListener('click', function () { w.classList.contains('open') ? close() : open(); });
    w.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && w.classList.contains('open')) { e.stopPropagation(); close(); b.focus(); }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && w.classList.contains('open')) { e.preventDefault();
        var os = [].slice.call(l.querySelectorAll('.mc-dd-o')), i = os.indexOf(document.activeElement); os[(i + (e.key === 'ArrowDown' ? 1 : -1) + os.length) % os.length].focus(); } });
    w.appendChild(b); w.appendChild(l); dds.appendChild(w);
    var m = {close: close, sync: sync, w: w}; menus.push(m); return m;
  }
  var chips = [].slice.call(filters.querySelectorAll('.chip'));
  var catMenu = menu('Category', chips.map(function (c) { var n = c.querySelector('span'); return {v: c.dataset.cat || 'all', t: c.textContent.replace(n ? n.textContent : '', '').trim(), n: n ? n.textContent : null}; }),
    function () { var on = filters.querySelector('.chip.on'); return on ? (on.dataset.cat || 'all') : 'all'; },
    function (v) { var c = chips.filter(function (x) { return (x.dataset.cat || 'all') === v; })[0]; if (c) c.click(); });
  var hMenu = menu('Height', [].map.call(size.options, function (o) { var m = /^(.*?)\s*\((\d+)\)\s*$/.exec(o.textContent); return {v: o.value, t: m ? m[1] : o.textContent, n: m ? m[2] : null}; }),
    function () { return size.value; },
    function (v) { size.value = v; size.dispatchEvent(new Event('change', {bubbles: true})); });
  sLabel.insertAdjacentElement('afterend', dds);
  document.addEventListener('click', function (e) { if (!dds.contains(e.target)) menus.forEach(function (m) { m.close(); }); });
  page.classList.add('mc-calm');

  /* ---- sliding indicators ---- */
  var catInd = el('span', 'mc-ind'); filters.appendChild(catInd);
  function place(ind, a, box) {
    if (!a || !a.offsetWidth) { ind.classList.remove('on'); return; }
    var cs = getComputedStyle(a), pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0;
    var w = Math.max(8, a.offsetWidth - pl - pr), x = a.offsetLeft + pl, y = a.offsetTop + a.offsetHeight - 1;
    ind.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scaleX(' + w + ')';
    if (!ind.classList.contains('on')) { ind.style.transition = 'none'; void ind.offsetWidth; ind.style.transition = ''; ind.classList.add('on'); }
  }
  function syncControls() {
    [].forEach.call(seg.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.dataset.v === size.value ? 'true' : 'false'); });
    place(segInd, seg.querySelector('[aria-pressed="true"]'));
    place(catInd, filters.querySelector('.chip.on'));
    menus.forEach(function (m) { m.sync(); });
    syncClear();
  }

  /* ---- result line + pager ---- */
  result.innerHTML = '';
  var res = el('span', 'mc-res'), pgInfo = el('span', 'mc-pg');
  result.appendChild(res); result.appendChild(pgInfo);
  var pager = el('nav', 'mc-pager'); pager.setAttribute('aria-label', 'Collection pages');
  var pinfo = el('span', 'mc-pinfo');
  var anchor = page.querySelector('.note-end') || groups[groups.length - 1].nextSibling;
  groups[0].parentNode.insertBefore(pager, anchor);
  pager.insertAdjacentElement('afterend', pinfo);

  function tick(n, text) { if (n.textContent === text.replace(/<[^>]+>/g, '')) return; n.innerHTML = text; n.classList.remove('mc-tick'); void n.offsetWidth; n.classList.add('mc-tick'); }
  function shownList() { return prods.filter(function (a) { return !a.hidden; }); }
  function cols() {
    var g = page.querySelector('.cgroup:not([hidden]):not(.mc-off) .pgrid') || page.querySelector('.pgrid');
    return Math.max(1, getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length);
  }
  function btn(cls, html, label, p) {
    var b = el('button', cls, html); b.type = 'button'; if (label) b.setAttribute('aria-label', label); if (p) b.dataset.p = p; return b;
  }
  function renderPager() {
    pager.innerHTML = ''; var total = shownList().length, shown = Math.min(total, cur * PER);
    pager.hidden = total <= PER; pinfo.hidden = true;
    if (pager.hidden) return;
    var bar = el('span', 'mc-prog'); bar.style.setProperty('--p', (shown / total).toFixed(3)); pager.appendChild(bar);
    var t = el('span', 'mc-count'); t.innerHTML = '<b>' + shown + '</b> of ' + total + ' pieces'; pager.appendChild(t);
    if (shown < total) { var more = btn('mc-more', 'Show ' + Math.min(PER, total - shown) + ' more <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>', null, cur + 1); pager.appendChild(more); }
  }

  /* lay out the current page: hide off-page cards, stagger columns, update text */
  function layout(animate) {
    var list = shownList(), total = list.length;
    pages = Math.max(1, Math.ceil(total / PER)); if (cur > pages) cur = pages;
    var from = 0, to = Math.min(total, cur * PER), on = list.slice(from, to), onSet = new Set(on);
    prods.forEach(function (a) { a.classList.toggle('mc-off', !a.hidden && !onSet.has(a)); });
    groups.forEach(function (g) { g.classList.toggle('mc-off', !g.hidden && !g.querySelector('.prod:not([hidden]):not(.mc-off)')); });
    var c = cols(), idx = new Map();
    on.forEach(function (a) { var g = a.parentNode, k = idx.get(g) || 0; a.style.setProperty('--mc-c', k % c); idx.set(g, k + 1); });
    if (animate && !calm) {
      var rise = on.filter(function (a) { return a.classList.contains('in') && (animate === 'all' || !(prevShown && prevShown.has(a))); });
      rise.forEach(function (a, n) { a.classList.remove('mc-rise'); a.style.setProperty('--mc-i', Math.min(n, 8)); });
      if (rise.length) { void page.offsetWidth; rise.forEach(function (a) { a.classList.add('mc-rise'); }); }
    }
    prevShown = onSet;
    if (res.parentNode !== result) { result.textContent = ''; result.appendChild(res); result.appendChild(pgInfo); res.textContent = ''; pgInfo.textContent = ''; }
    var filtered = list.length !== prods.length;
    if (!total) tick(res, 'No pieces match');
    else if (pages < 2) tick(res, 'Showing ' + (filtered ? '<b>' + total + '</b> matching ' + (total === 1 ? 'piece' : 'pieces') : 'all <b>' + total + '</b> pieces'));
    else tick(res, 'Showing <b>' + to + '</b> of <b>' + total + '</b> ' + (filtered ? 'matching pieces' : 'pieces'));
    tick(pgInfo, '');
    pinfo.textContent = pages > 1 ? 'Page ' + cur + ' of ' + pages + ' · ' + total + ' pieces' : '';
    renderPager();
  }
  page.querySelectorAll('.prod').forEach(function (a) { a.addEventListener('animationend', function (e) { if (e.animationName === 'mc-up') a.classList.remove('mc-rise'); }); });

  function onFilter() { cur = 1; layout(true); syncControls(); }
  q.addEventListener('input', onFilter); size.addEventListener('change', onFilter);
  [].forEach.call(filters.querySelectorAll('.chip'), function (c) { c.addEventListener('click', function () { onFilter(); }); });

  var busy = false;
  function go(p) {
    p = Math.max(1, Math.min(pages, p)); if (p === cur || busy) return;
    var mb = pager.querySelector('.mc-more'); if (mb && document.activeElement === mb) mb.blur();
    cur = p; layout(true);                     /* new pieces rise in below; the page does not move */
  }
  pager.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) go(+b.dataset.p); });

  /* a #ref-NNN link lands on the page holding that piece */
  function refPage() {
    var m = /^#ref-(\d{3})$/.exec(location.hash); if (!m) return;
    var a = document.getElementById('ref-' + m[1]); if (!a || a.hidden || !a.closest('#collection .cgroup')) return;
    var i = shownList().indexOf(a); if (i < 0) return;
    var p = Math.floor(i / PER) + 1; if (p !== cur) { cur = p; layout(false); }
  }
  window.addEventListener('hashchange', function () { refPage(); requestAnimationFrame(syncControls); });

  /* when the viewer closes, keep the grid on the page of the last piece seen */
  var lb = document.getElementById('lb');
  if (lb && 'MutationObserver' in window) {
    var wasOpen = false;
    new MutationObserver(function () {
      var open = lb.classList.contains('open');
      if (wasOpen && !open) {
        var t = lb.getAttribute('data-mc-last');
        if (t) { var a = document.getElementById(t), i = a ? shownList().indexOf(a) : -1; if (i > -1 && Math.floor(i / PER) + 1 !== cur) { cur = Math.floor(i / PER) + 1; layout(false); a.scrollIntoView({block: 'center', behavior: 'instant'}); } }
      }
      wasOpen = open;
    }).observe(lb, {attributes: true, attributeFilter: ['class']});
    new MutationObserver(function () { var m = /^#ref-(\d{3})$/.exec(location.hash); if (m && lb.classList.contains('open')) lb.setAttribute('data-mc-last', 'ref-' + m[1]); })
      .observe(document.getElementById('lbTitle') || lb, {childList: true, characterData: true, subtree: true});
  }

  /* ---- one observer for headings ---- */
  var heads = [].slice.call(page.querySelectorAll('.cgroup-head'));
  if (calm || !('IntersectionObserver' in window)) heads.forEach(function (h) { h.classList.add('mc-in'); });
  else {
    var io = new IntersectionObserver(function (l) {
      l.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('mc-in'); io.unobserve(en.target); } });
    }, {rootMargin: '0px 0px -8% 0px', threshold: 0.2});
    heads.forEach(function (h) { io.observe(h); });
  }
  /* featured: column stagger for the reveal */
  [].forEach.call(page.querySelectorAll('.feat-grid .feat'), function (f, i) { f.style.setProperty('--mc-c', i % 4); });

  var rz = 0;
  function onResize() { cancelAnimationFrame(rz); rz = requestAnimationFrame(function () { layout(false); syncControls(); }); }
  window.addEventListener('resize', onResize);
  if ('ResizeObserver' in window) new ResizeObserver(function () { requestAnimationFrame(syncControls); }).observe(filters);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncControls);

  layout(false); refPage(); syncControls();
})();
