/* Motion & polish for #custom, #contact, the piece picker (#pk) and footer links.
   Purely additive: never rebinds the form or picker handlers. */
(function(){
  var custom = document.getElementById('custom'), contact = document.getElementById('contact');
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. parallax hooks for the shared engine (set synchronously) ---- */
  function px(sel, v){ if (!custom) return; [].forEach.call(custom.querySelectorAll(sel), function(el){ if (!el.hasAttribute('data-px')) el.setAttribute('data-px', v); }); }
  px('.ab-hero .stage img', '0.08');
  /* small framed photos only drift on wider screens, where the frame is big enough */
  if (!window.matchMedia || matchMedia('(min-width: 900px)').matches){
    px('.use .stage img', '0.045');
    px('.refgrid .stage img', '-0.04');
  }

  /* ---- 2. tactile press: a soft gold ripple from the click point ---- */
  var SEL = '.btn,.pk-open,.inq-opt,.chip,.pk-x,.cc-cat';
  var DARK = '.pk-open,.chip,.pk-x,.inq-opt,.cc-cat';
  if (!calm) document.addEventListener('pointerdown', function(e){
    if (e.button && e.button !== 0) return;
    var el = e.target.closest && e.target.closest(SEL);
    if (!el || !el.closest('#custom,#contact,#pk')) return;
    var r = el.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2;
    var dot = document.createElement('span');
    dot.className = 'cc-rip';
    var light = el.matches('.btn-line') && !el.closest('.on-navy');
    if (el.matches(DARK) || light) dot.className += ' dark';
    dot.setAttribute('aria-hidden', 'true');
    dot.style.setProperty('--s', s + 'px');
    dot.style.left = (e.clientX - r.left) + 'px';
    dot.style.top = (e.clientY - r.top) + 'px';
    el.appendChild(dot);
    setTimeout(function(){ if (dot.parentNode) dot.parentNode.removeChild(dot); }, 1300);
  }, {passive: true});

  /* ---- 3. contact: fill the quiet areas with the site's own copy ---- */
  var WA = 'https://wa.me/9613307019?text=';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  function ic(id){ return '<svg class="ic" aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>'; }
  function make(tag, cls, html){ var n = document.createElement(tag); n.className = cls; n.innerHTML = html; return n; }

  if (contact){
    var form = contact.querySelector('#inqForm');
    if (form && !contact.querySelector('.cc-cat')){
      var cat = make('a', 'cc-cat',
        ic('i-doc') +
        '<span class="cc-cat-t"><strong>Prefer a PDF?</strong><span>A PDF catalog with photos and dimensions for every piece, sent to you on WhatsApp.</span></span>' +
        '<span class="cc-cat-go">Request the catalog ' + ARROW + '</span>');
      cat.href = WA + 'Hello%20HyDecor%2C%20could%20you%20send%20me%20the%20PDF%20catalog%3F';
      cat.target = '_blank'; cat.rel = 'noopener';
      form.appendChild(cat);
    }

    var grid = contact.querySelector('.ct-grid');
    if (grid && !contact.querySelector('.cc-how')){
      var how = make('section', 'cc-how',
        '<p class="cc-how-h">How an inquiry works</p>' +
        '<ol>' +
          '<li><span class="cc-n">' + ic('i-grid') + '</span><h3><b>01</b>Choose a piece</h3><p>Browse the collection with photos, or choose a custom piece or a general question.</p></li>' +
          '<li><span class="cc-n">' + ic('i-chat') + '</span><h3><b>02</b>Send on WhatsApp</h3><p>Your message opens in WhatsApp, ready to send.</p></li>' +
          '<li><span class="cc-n">' + ic('i-discuss') + '</span><h3><b>03</b>We reply</h3><p>We will reply on WhatsApp. Ask us about any piece, its finishes and current availability.</p></li>' +
        '</ol>');
      how.setAttribute('aria-label', 'How an inquiry works');
      grid.appendChild(how);
      if (calm || !('IntersectionObserver' in window)) how.classList.add('in');
      else {
        var io = new IntersectionObserver(function(list){
          list.forEach(function(en){ if (en.isIntersecting){ how.classList.add('in'); io.disconnect(); } });
        }, {threshold: 0.25});
        io.observe(how);
      }
    }

    var wh = contact.querySelector('.wh');
    if (wh && !contact.querySelector('.cc-atl')){
      var atl = make('div', 'cc-atl',
        '<span class="cc-atl-k"><i></i>Our atelier · Lebanon · Since 1918</span>' +
        '<strong>A family craft since 1918</strong>' +
        '<p>Handcrafted statues, sculptures and architectural décor, carried from Armenia to Lebanon and now in its fourth generation.</p>' +
        '<a href="index.html#story">Our story</a>');
      wh.appendChild(atl);
    }
  }
})();
