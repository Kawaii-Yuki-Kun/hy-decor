/* About page motion (2026-11): hairline arches in the hero, parallax hooks,
   and an unmask reveal for the closing image strip. Everything is scoped to
   #about and is additive: without this file the page is complete and static. */
(function(){
  var root = document.getElementById('about');
  if (!root) return;
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function each(sel, fn){ [].forEach.call(root.querySelectorAll(sel), fn); }
  function px(sel, v){ each(sel, function(e){ if (!e.hasAttribute('data-px')) e.setAttribute('data-px', v); }); }

  /* --- 1. hero: two hairline arches around the statue, with slow gold glints --- */
  var hero = root.querySelector('.ab-hero');
  var stage = hero && hero.querySelector('.stage');
  var lines = null, svg = null, arches = [];
  if (hero && stage){
    lines = document.createElement('div');
    lines.className = 'ab-lines';
    lines.setAttribute('aria-hidden', 'true');
    svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('focusable', 'false');
    for (var k = 0; k < 2; k++){
      var g = document.createElementNS(SVGNS, 'g');
      var base = document.createElementNS(SVGNS, 'path');
      var glint = document.createElementNS(SVGNS, 'path');
      base.setAttribute('class', 'base');
      glint.setAttribute('class', 'glint');
      base.setAttribute('pathLength', '1000');
      glint.setAttribute('pathLength', '1000');
      g.appendChild(base); g.appendChild(glint); svg.appendChild(g);
      arches.push([base, glint]);
    }
    lines.appendChild(svg);
    hero.insertBefore(lines, hero.firstChild);
    hero.classList.add('ab-arched');
  }

  function drawArches(){
    if (!svg) return;
    var hr = hero.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    if (!hr.width || !sr.width) return;
    var W = Math.round(hr.width), H = Math.round(hr.height);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var cx = sr.left - hr.left + sr.width / 2, top = sr.top - hr.top;
    var narrow = W < 600;
    var gaps = narrow ? [30, 0] : [44, 96];
    arches.forEach(function(pair, i){
      var gap = gaps[i];
      pair[0].parentNode.style.display = gap ? '' : 'none';
      if (!gap) return;
      var r = sr.width / 2 + gap, y0 = Math.max(8, top - gap), bottom = H + 40;
      var rx = r, ry = Math.min(r, (sr.height * .3) + gap);
      var d = 'M' + (cx - r).toFixed(1) + ' ' + bottom +
              ' L' + (cx - r).toFixed(1) + ' ' + (y0 + ry).toFixed(1) +
              ' A' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 0 1 ' + (cx + r).toFixed(1) + ' ' + (y0 + ry).toFixed(1) +
              ' L' + (cx + r).toFixed(1) + ' ' + bottom;
      pair[0].setAttribute('d', d); pair[1].setAttribute('d', d);
    });
  }

  /* --- 2. parallax hooks for the shared engine (set synchronously, before DOMContentLoaded) --- */
  if (lines) lines.setAttribute('data-px', '0.08');
  px('#story .arch-fig .stage img', '0.06');
  px('.fam-ph img', '0.05');

  drawArches();
  if ('ResizeObserver' in window && hero){ new ResizeObserver(drawArches).observe(hero); }
  else { window.addEventListener('resize', drawArches); }
  /* re-measure once the hero entrance (translate) has settled */
  function later(){ setTimeout(drawArches, 60); setTimeout(drawArches, 1400); }
  window.addEventListener('hashchange', later);
  window.addEventListener('load', later);

  /* --- 3. closing image strip: bottom-up unmask when it scrolls into view --- */
  if (calm || !('IntersectionObserver' in window)) return;
  var strips = [].slice.call(root.querySelectorAll('.strip'));
  strips.forEach(function(s){ s.classList.add('ab-rv'); });
  var io = new IntersectionObserver(function(list){
    list.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('ab-in'); io.unobserve(en.target); } });
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.12});
  strips.forEach(function(s){ io.observe(s); });
})();
