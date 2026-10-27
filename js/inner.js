(function () {
  'use strict';
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var dock = document.querySelector('.dock'), cta = document.getElementById('contact');
  function frame() {
    if (!dock || !cta) return;
    var vh = window.innerHeight;
    dock.classList.toggle('on', window.scrollY > vh * 0.5);
    dock.classList.toggle('hide', cta.getBoundingClientRect().top < vh * 0.6);
  }
  window.addEventListener('scroll', frame, { passive: true });
  window.addEventListener('resize', frame);
  frame();
  $$('.acc-q').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      $$('.acc-q').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
})();
