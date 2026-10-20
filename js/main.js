/* ============================================================
   SOAR ENOUGH FOUNDATION — Main JavaScript
   Scroll animations · Counters · Testimonials · Gallery · Forms
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    initReveal();
    initCounters();
    initTestimonials();
    initGallery();
    initForms();
    initSmoothAnchors();
    initScrollTop();
  });
});

/* ---------- Scroll Reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

/* ---------- Animated Counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        runCounter(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}

function runCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const prefix   = el.dataset.prefix || '';
  const suffix   = el.dataset.suffix || '';
  const duration = 2000;
  const start    = performance.now();

  function tick(now) {
    const p    = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val  = Math.floor(ease * target);
    el.textContent = prefix + val.toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + target.toLocaleString() + suffix;
  }
  requestAnimationFrame(tick);
}

/* ---------- Testimonial Slider ---------- */
function initTestimonials() {
  const cards = document.querySelectorAll('.test-card');
  const dots  = document.querySelectorAll('.test-dot');
  if (!cards.length) return;

  let idx = 0, timer;

  function show(i) {
    cards.forEach(c => c.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    cards[i].classList.add('active');
    dots[i].classList.add('active');
    idx = i;
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { show(i); resetAuto(); }));

  function auto()    { timer = setInterval(() => show((idx + 1) % cards.length), 6000); }
  function resetAuto() { clearInterval(timer); auto(); }

  show(0);
  auto();
}

/* ---------- Gallery + Lightbox ---------- */
function initGallery() {
  const btns  = document.querySelectorAll('.gallery-filter');
  const items = document.querySelectorAll('.gallery-item');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      items.forEach(it => {
        const match = cat === 'all' || it.dataset.cat === cat;
        it.style.display = match ? '' : 'none';
        if (match) it.style.animation = 'fadeIn .4s ease both';
      });
    });
  });

  const box = document.getElementById('lightbox');
  if (!box) return;

  const img     = box.querySelector('img');
  const cap     = box.querySelector('.lightbox-caption');
  const closeBtn = box.querySelector('.lightbox-close');

  items.forEach(it => {
    it.addEventListener('click', () => {
      img.src = it.querySelector('img').src;
      const title = it.querySelector('h4');
      cap.textContent = title ? title.textContent : '';
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => { box.classList.remove('open'); document.body.style.overflow = ''; };
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ---------- Forms ----------
   The forms themselves are plain HTML that post to Formspree:
     <form action="https://formspree.io/f/xdeavlbk" method="POST">
   That markup works on its own and stays the fallback.

   This handler is progressive enhancement only. Formspree's free plan
   ignores the _next field, so the browser would land on Formspree's
   own "Thanks" page. We post with Accept: application/json instead,
   read the response, and send the visitor to thanks.html ourselves.
   Any failure falls back to a normal form post.
------------------------------------------------------------ */
function initForms() {
  const forms = [
    document.getElementById('contactForm'),
    document.getElementById('newsletterForm'),
    document.getElementById('footerNewsletterForm')
  ].filter(Boolean);

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('submit failed');
        const data = await res.json();
        if (!data.ok) throw new Error('submit rejected');
        window.location.href = form.getAttribute('data-thanks') || 'thanks.html';
        return;
      } catch (err) {
        /* fall through to the native post below */
      }

      if (btn) btn.disabled = false;
      form.submit();
    });
  });
}

/* ---------- Smooth Anchors ---------- */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    });
  });
}

/* ---------- Scroll-to-Top ---------- */
function initScrollTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 480), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- FAQ Toggles ---------- */
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-answer').style.maxHeight = '0';
  });

  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}
