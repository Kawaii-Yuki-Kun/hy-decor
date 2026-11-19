/* Shared: parallax engine ([data-px]), homepage parallax targets, medallion hover, the "Our story" door. */
(function(){
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- homepage parallax targets ---------- */
  [['.hero-lines svg', .14], ['.hero .niche', .07], ['.hero .hv', .045], ['.heritage .her2-vis', .06],
   ['.her2-stats', -.03], ['#atelier .at-medal', -.08], ['#atelier .at-lead', .05], ['#atelier .at-orn', -.05]
  ].forEach(function(t){ [].forEach.call(document.querySelectorAll(t[0]), function(el){ if(!el.hasAttribute('data-px')) el.setAttribute('data-px', t[1]); }); });

  /* ---------- section heads: staggered rise + eyebrow line + one gold glint on the heading ---------- */
  (function(){
    if (calm || !('IntersectionObserver' in window)) return;
    var skip = '.hero, .ab-hero, .col-head, .fly, .lb, .pk, header';
    var boxes = [];
    [].forEach.call(document.querySelectorAll('main .eyebrow, .final .eyebrow'), function(eb){
      var box = eb.parentNode; if (!box || boxes.indexOf(box) > -1 || box.closest(skip)) return;
      var h = box.querySelector(':scope > h1, :scope > h2, :scope > .h2'); if (!h) return;
      if (getComputedStyle(h).animationName !== 'none' || getComputedStyle(eb).animationName !== 'none') return;   /* a page script already animates it */
      boxes.push(box);
    });
    var io = new IntersectionObserver(function(l){ l.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('sx-on'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -10% 0px', threshold:.25});
    boxes.forEach(function(box){
      var i = 0;
      [].forEach.call(box.children, function(c){
        if (c.classList.contains('rv') || c.tagName === 'SCRIPT') return;
        var lis = (c.tagName === 'UL' || c.tagName === 'OL') && c.children.length <= 6 ? c.children : null;
        if (lis) [].forEach.call(lis, function(li){ li.classList.add('sx-i'); li.style.setProperty('--i', Math.min(i++, 9)); });
        else { c.classList.add('sx-i'); c.style.setProperty('--i', Math.min(i++, 9)); }
      });
      var h = box.querySelector(':scope > h1, :scope > h2, :scope > .h2'), cs = getComputedStyle(h);
      if (cs.backgroundImage === 'none' && cs.webkitBackgroundClip !== 'text'){ h.style.setProperty('--sx-c', cs.color); h.classList.add('sx-g'); }
      box.classList.add('sx'); io.observe(box);
    });
  })();

  /* ---------- parallax engine ---------- */
  var els = [], ticking = false;
  function scan(){ els = [].slice.call(document.querySelectorAll('[data-px]')); req(); }
  function upd(){
    ticking = false; var vh = window.innerHeight;
    for (var i = 0; i < els.length; i++){
      var el = els[i]; if (!el.offsetParent && el.tagName !== 'svg' && getComputedStyle(el).position !== 'fixed') continue;
      var sp = parseFloat(el.getAttribute('data-px')) || 0, cur = el._py || 0;
      var r = el.getBoundingClientRect(), top = r.top - cur;
      if (top > vh * 1.4 || top + r.height < -vh * 0.4) continue;
      var y = -((top + r.height / 2) - vh / 2) * sp;
      y = Math.max(-140, Math.min(140, y));
      if (Math.abs(y - cur) > 0.2){ el._py = y; el.style.translate = '0 ' + y.toFixed(1) + 'px'; }
    }
  }
  function req(){ if (!ticking){ ticking = true; requestAnimationFrame(upd); } }
  if (!calm){
    window.addEventListener('scroll', req, {passive:true});
    window.addEventListener('resize', req);
    window.addEventListener('hashchange', function(){ setTimeout(scan, 80); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
    window.addEventListener('load', scan);
  }

  /* ---------- closing film: pause off-screen, a touch faster on hover ---------- */
  var fx = document.querySelector('.final-fx');
  if (fx){ if (calm){ fx.pause(); } else if ('IntersectionObserver' in window){
      new IntersectionObserver(function(l){ l.forEach(function(e){ if (e.isIntersecting){ var p = fx.play(); if (p && p.catch) p.catch(function(){}); } else fx.pause(); }); }).observe(fx); }
    var fs = fx.parentNode; fs.addEventListener('mouseenter', function(){ fx.playbackRate = 1.5; }); fs.addEventListener('mouseleave', function(){ fx.playbackRate = 1; }); }

  /* ---------- medallion: speeds up a touch on hover ---------- */
  var mv = document.querySelector('.at-medal video');
  if (mv){ var m = mv.parentNode;
    m.addEventListener('mouseenter', function(){ mv.playbackRate = 1.6; });
    m.addEventListener('mouseleave', function(){ mv.playbackRate = 1; }); }

  /* ---------- scroll fly-through (frames scrubbed by scroll) ---------- */
  (function(){
    var fly = document.querySelector('.fly'); if (!fly || calm) return;
    var N = 120, small = window.innerWidth < 900, dir = small ? 'video/fly-sm/' : 'video/fly/';
    var at = fly.nextElementSibling && fly.nextElementSibling.querySelector('.atelier');
    var c = fly.querySelector('.fly-c'), ctx = c.getContext('2d'), st = fly.querySelector('.fly-stick');
    var imgs = [], loaded = 0, last = -1, ticking = false;
    function pad(i){ return ('00' + i).slice(-3); }
    var probe = new Image();
    probe.onload = function(){ fly.classList.add('ready'); start(); };
    probe.src = dir + 'f000.jpg';
    function start(){
      for (var i = 0; i < N; i++){ var im = new Image(); im.decoding = 'async'; im.onload = function(){ loaded++; if (loaded === 1 || loaded % 10 === 0) draw(true); }; im.src = dir + 'f' + pad(i) + '.jpg'; imgs.push(im); }
      imgs[0] = probe; size(); window.addEventListener('resize', function(){ size(); draw(true); });
      window.addEventListener('scroll', req, {passive:true}); window.addEventListener('hashchange', function(){ setTimeout(function(){ size(); draw(true); }, 80); });
      draw(true);
    }
    function size(){ var d = Math.min(2, window.devicePixelRatio || 1); c.width = Math.round(c.clientWidth * d); c.height = Math.round(c.clientHeight * d); last = -1; }
    function req(){ if (!ticking){ ticking = true; requestAnimationFrame(function(){ ticking = false; draw(false); }); } }
    function clamp(v){ return Math.max(0, Math.min(1, v)); }
    function ease(t){ return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function draw(force){
      var r = fly.getBoundingClientRect(), vh = window.innerHeight; if (!r.height) return;
      var p = clamp(-r.top / (r.height - vh));
      /* phase 1 (0-.22): the arch window opens to full screen; phase 2: frames play; last 10%: light washes to ivory */
      var o = ease(clamp(p / .22)), ix = small ? 12 : 33;
      st.style.setProperty('--ix', (ix * (1 - o)).toFixed(2) + '%');
      st.style.setProperty('--it', (14 * (1 - o)).toFixed(2) + '%');
      st.style.setProperty('--ib', (10 * (1 - o)).toFixed(2) + '%');
      st.style.setProperty('--rt', (50 * (1 - o)).toFixed(2) + '%');
      st.style.setProperty('--rv', (28 * (1 - o)).toFixed(2) + '%');
      st.style.setProperty('--z', (1 + .06 * clamp((p - .2) / .8)).toFixed(4));
      st.style.setProperty('--co', (1 - clamp((p - .08) / .22)).toFixed(3));
      st.style.setProperty('--cs', (1 + .5 * clamp(p / .3)).toFixed(3));
      st.style.setProperty('--cy', (-40 * clamp(p / .3)).toFixed(1) + 'px');
      st.style.setProperty('--wash', clamp((p - .8) / .1).toFixed(3));
      /* hand-over: the stage fades away and the atelier, already in place underneath, settles in */
      var h = clamp((p - .9) / .1);
      st.style.setProperty('--so', (1 - h).toFixed(3));
      if (at){ at.style.setProperty('--az', (1.07 - .07 * ease(h)).toFixed(4)); at.style.setProperty('--ao', (.35 + .65 * h).toFixed(3)); }
      st.style.pointerEvents = h > .5 ? 'none' : '';
      var f = Math.round(clamp((p - .04) / .82) * (N - 1));
      if (!force && f === last) return;
      var im = imgs[f]; for (var k = f; (!im || !im.complete || !im.naturalWidth) && k >= 0; k--) im = imgs[k];
      if (!im || !im.naturalWidth) return; last = f;
      var cw = c.width, ch = c.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
    }
  })();

  /* ---------- the door ---------- */
  var vis = document.querySelector('.heritage .her2-vis'), frame = vis && vis.querySelector('.her2-frame');
  if (!frame) return;
  var door = document.createElement('div');
  door.className = 'door'; door.setAttribute('role', 'button'); door.tabIndex = 0;
  door.setAttribute('aria-label', 'Open the door: watch four generations of HyDecor'); door.setAttribute('aria-expanded', 'false');
  var inner = document.createElement('div'); inner.className = 'door-in';
  var v = document.createElement('video');
  v.muted = true; v.playsInline = true; v.preload = 'none'; v.setAttribute('playsinline', ''); v.loop = true;
  v.poster = 'video/generations-door-poster.jpg';
  v.innerHTML = '<source src="video/generations-door.webm" type="video/webm"><source src="video/generations-door.mp4" type="video/mp4">';
  inner.appendChild(v);
  var x = document.createElement('button'); x.type = 'button'; x.className = 'door-x'; x.setAttribute('aria-label', 'Close the door'); x.textContent = '×';
  inner.appendChild(x);
  var L = document.createElement('div'); L.className = 'door-leaf door-l';
  var R = document.createElement('div'); R.className = 'door-leaf door-r';
  var yr = frame.querySelector('.her2-year'); if (yr) yr.textContent = '1918';   /* static on the door: odometers don't clip inside 3D leaves */
  var clone = frame.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); clone.removeAttribute('role');
  frame.parentNode.insertBefore(door, frame);
  L.appendChild(frame); R.appendChild(clone);
  [L, R].forEach(function(leaf){ var h = document.createElement('span'); h.className = 'door-h'; h.setAttribute('aria-hidden', 'true'); leaf.appendChild(h); });
  door.appendChild(inner); door.appendChild(L); door.appendChild(R);
  var cue = document.createElement('span'); cue.className = 'door-cue'; cue.textContent = 'Open the door';
  door.parentNode.insertBefore(cue, door.nextSibling);
  function open(){ if (door.classList.contains('open')) return;
    door.classList.add('open'); door.setAttribute('aria-expanded', 'true'); cue.textContent = 'Four generations';
    v.preload = 'auto'; try { v.currentTime = 0; } catch(e){}
    setTimeout(function(){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }, calm ? 0 : 650); }
  function close(e){ if (e) e.stopPropagation();
    door.classList.remove('open'); door.setAttribute('aria-expanded', 'false'); cue.textContent = 'Open the door';
    setTimeout(function(){ v.pause(); }, 900); door.focus({preventScroll:true}); }
  door.addEventListener('click', function(e){ if (e.target === x) return; open(); });
  door.addEventListener('keydown', function(e){
    if ((e.key === 'Enter' || e.key === ' ') && e.target === door){ e.preventDefault(); door.classList.contains('open') ? close() : open(); }
    if (e.key === 'Escape' && door.classList.contains('open')) close(); });
  x.addEventListener('click', close);
})();
