(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* hero headline: reveal word by word */
  var h = $('[data-words]');
  if (h && !reduce) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
    }).join(' ');
  }

  /* opening: a junk pile, swept away by the brand chevrons */
  var root = document.documentElement;
  function ready() { root.classList.remove('intro-on'); root.classList.add('ready'); }
  var seen = false;
  try { seen = sessionStorage.getItem('swift-intro') === '1'; sessionStorage.setItem('swift-intro', '1'); } catch (e) {}
  if (reduce || seen) {
    ready();
  } else {
    root.classList.add('intro-on');
    var el = document.createElement('div');
    el.className = 'intro';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="lay l-clean"><img src="img/clean.jpg" alt=""><div class="intro-word">Junk, gone.</div></div>' +
      '<div class="lay l-peach"></div><div class="lay l-orange"></div><div class="lay l-navy"></div>' +
      '<div class="lay l-photo"><img src="img/estate.jpg" alt=""><div class="intro-word">Junk,</div></div>';
    document.body.appendChild(el);
    var lays = $$('.lay', el).slice(1), D = 14, GAP = 5, DUR = 1250, HOLD = 1900, started = false, gone = false;
    var paint = function (E) {
      lays.forEach(function (l, i) {
        var e = E - (lays.length - 1 - i) * GAP;
        l.style.clipPath = 'polygon(' + e + '% 0,' + (e + D) + '% 50%,' + e + '% 100%,100% 100%,100% 0)';
      });
    };
    paint(-D);
    var sweep = function () {
      var t0 = performance.now();
      requestAnimationFrame(function step(now) {
        var k = Math.min(1, (now - t0) / DUR);
        var ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        paint(-D + ease * (100 + D + GAP * 3 + D));
        if (k < 1) requestAnimationFrame(step); else { $$('.lay', el).slice(1).forEach(function (l) { l.style.display = 'none'; }); setTimeout(lift, 650); }
      });
    };
    var lift = function () {
      if (gone) return;
      gone = true;
      el.style.transition = 'transform .95s cubic-bezier(.7,0,.2,1)';
      el.style.transform = 'translateY(-100%)';
      ready();
      setTimeout(function () { el.remove(); }, 1000);
    };
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';
    el.addEventListener('click', lift);
    var go = function () {
      if (started) return;
      started = true;
      el.classList.add('go');
      setTimeout(sweep, HOLD);
    };
    var ims = $$('img', el), left = ims.length;
    ims.forEach(function (m) { if (m.complete) left--; else { m.addEventListener('load', dec); m.addEventListener('error', dec); } });
    function dec() { if (--left === 0) go(); }
    if (left === 0) go();
    setTimeout(go, 1500);
    setTimeout(function () { ready(); if (el.parentNode) el.remove(); }, 8000);
  }

  /* scroll-linked work: hero frame, nav state, band parallax, mobile dock */
  var nav = $('#nav'), media = $('#heroMedia'), band = $('.band-media'), dock = $('.dock'), cta = $('#contact');
  var ticking = false;
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function frame() {
    ticking = false;
    var vh = window.innerHeight, y = window.scrollY;
    nav.classList.toggle('solid', y > 24);
    if (media) {
      var top = media.getBoundingClientRect().top;
      var p = reduce ? 1 : clamp((vh * 0.66 - top) / (vh * 0.52));
      media.style.setProperty('--p', p.toFixed(4));
    }
    if (band && !reduce) {
      var r = band.parentNode.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        var t = (r.top + r.height / 2 - vh / 2) / vh;
        band.style.transform = 'translate3d(0,' + (t * -7).toFixed(2) + '%,0)';
      }
    }
    if (dock) {
      var heroOut = y > vh * 0.7;
      var ctaR = cta.getBoundingClientRect();
      dock.classList.toggle('on', heroOut);
      dock.classList.toggle('hide', ctaR.top < vh * 0.6);
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();

  /* quiet reveal on scroll */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* timeline progress */
  var tl = $('#tl'), tlSteps = $$('.tl-step');
  function tlFrame() {
    if (!tl) return;
    var r = tl.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduce ? 1 : clamp((vh * 0.62 - r.top) / (r.height * 0.9));
    tl.style.setProperty('--p', p.toFixed(3));
    tlSteps.forEach(function (s) {
      var n = s.querySelector('.tl-node').getBoundingClientRect();
      s.classList.toggle('lit', reduce || n.top + n.height / 2 < vh * 0.62);
    });
  }
  window.addEventListener('scroll', tlFrame, { passive: true });
  window.addEventListener('resize', tlFrame);
  tlFrame();

  /* request form */
  var rq = $('#rq');
  if (rq) {
    var err = $('#rqErr'), btn = $('.rq-go', rq), phoneIn = rq.elements.phone;
    phoneIn.addEventListener('input', function () {
      var d = phoneIn.value.replace(/\D/g, '').slice(0, 10), o = d;
      if (d.length > 6) o = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
      else if (d.length > 3) o = '(' + d.slice(0, 3) + ') ' + d.slice(3);
      phoneIn.value = o;
    });
    $$('input', rq).forEach(function (i) { i.addEventListener('input', function () { i.classList.remove('bad'); err.hidden = true; }); });
    rq.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = rq.elements, name = f.name.value.trim(), digits = f.phone.value.replace(/\D/g, '');
      if (f._honey.value) return;
      var bad = [];
      if (!name) bad.push(f.name);
      if (digits.length < 10) bad.push(f.phone);
      if (bad.length) {
        bad.forEach(function (i) { i.classList.add('bad'); });
        err.textContent = !name ? 'Please add your name and a phone number we can reach you on.' : 'Please enter a 10-digit phone number so we can call you back.';
        err.hidden = false; bad[0].focus(); return;
      }
      var items = $$('input[name=item]:checked', rq).map(function (c) { return c.value; });
      var fd = new FormData(rq);
      fd.delete('item'); fd.delete('kind'); fd.delete('zip'); fd.delete('message');
      fd.set('Job type', rq.querySelector('input[name=kind]:checked').value);
      fd.set('What needs to go', items.join(', ') || 'Not specified');
      fd.set('Details', f.message.value.trim() || 'None');
      fd.set('ZIP or neighborhood', f.zip.value.trim() || 'Not given');
      btn.disabled = true; btn.firstElementChild.textContent = 'Sending...';
      fetch('https://formsubmit.co/ajax/swift-junkremoval@outlook.com', {
        method: 'POST', headers: { Accept: 'application/json' }, body: fd
      }).then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); }).then(function () {
        $('#rqThanks').textContent = 'Thank you, ' + name.split(' ')[0] + '. We have your request.';
        $('.rq-form', rq).hidden = true; $('#rqDone').hidden = false;
      }).catch(function () {
        btn.disabled = false; btn.firstElementChild.textContent = 'Request a call back';
        err.textContent = 'That did not go through. Please call or text (702) 929-6544 and we will take it from there.';
        err.hidden = false;
      });
    });
  }

  /* what we haul: the photo follows the list */
  var rows = $$('.row'), pics = $$('.stack img'), list = $('.rows'), wide = window.matchMedia('(min-width: 981px)');
  function pick(k) {
    rows.forEach(function (r, i) { r.classList.toggle('on', i === k); });
    pics.forEach(function (p, i) { p.classList.toggle('on', i === k); });
  }
  if (rows.length) {
    var hold = 0;
    rows.forEach(function (r, i) {
      r.addEventListener('mouseenter', function () { if (wide.matches) { hold = Date.now(); pick(i); } });
    });
    window.addEventListener('scroll', function () {
      if (!wide.matches || Date.now() - hold < 400) return;
      var vh = window.innerHeight, best = 0, bd = 1e9;
      rows.forEach(function (r, i) {
        var b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - vh * 0.55);
        if (d < bd) { bd = d; best = i; }
      });
      pick(best);
    }, { passive: true });
    list.classList.add('live');
  }

  /* before / after loop: the clutter is swept away, then comes back */
  var lp = $('#loop');
  if (lp && !reduce) {
    var imgs = [$('.lp-a', lp), $('.lp-b', lp)], stripes = $$('.lp-s', lp), tag = $('.lp-tag', lp);
    var LD = 14, LG = 3, HOLD2 = 3200, SWEEP = 1700, top = 0, running = false, timer = 0, raf = 0;
    var edge = function (e) { return 'polygon(' + e + '% 0,100% 0,100% 100%,' + e + '% 100%,' + (e + LD) + '% 50%)'; };
    var paintLoop = function (E) {
      imgs[top].style.clipPath = edge(E);
      stripes.forEach(function (s, i) {
        var e = E - (stripes.length - i) * LG;
        s.style.clipPath = edge(e);
      });
    };
    var resetLoop = function () {
      imgs[top].style.zIndex = 5; imgs[1 - top].style.zIndex = 1;
      imgs[1 - top].style.clipPath = 'none';
      paintLoop(-LD - 1);
    };
    var sweepLoop = function () {
      var t0 = performance.now(), swapped = false;
      raf = requestAnimationFrame(function step(now) {
        var k = Math.min(1, (now - t0) / SWEEP);
        var ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        paintLoop(-LD - 1 + ease * (100 + LD + 1 + LG * 3 + LD));
        if (k > 0.45 && !swapped) { swapped = true; tag.classList.add('swap'); setTimeout(function () { tag.textContent = top === 0 ? 'After' : 'Before'; tag.classList.remove('swap'); }, 250); }
        if (k < 1) { raf = requestAnimationFrame(step); return; }
        top = 1 - top; resetLoop();
        if (running) timer = setTimeout(sweepLoop, HOLD2);
      });
    };
    resetLoop();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var on = es[0].isIntersecting;
        if (on && !running) { running = true; timer = setTimeout(sweepLoop, 1800); }
        else if (!on && running) { running = false; clearTimeout(timer); }
      }, { threshold: 0.35 }).observe(lp);
    }
  }

  /* faq accordion: one open at a time */
  $$('.acc-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      $$('.acc-q').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
})();
