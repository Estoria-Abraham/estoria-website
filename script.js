/* Estoria Building Co. — shared site behavior */

(function () {
  'use strict';

  /* ----- Mobile nav toggle ----- */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isOpen = toggle.classList.toggle('open');
      menu.classList.toggle('open');
      if (navLinks) navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        if (navLinks) navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----- Nav border on scroll ----- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = function () {
      if (window.scrollY > 24) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----- Scroll reveal ----- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ----- Set current year in footer ----- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Contact form (only on contact.html) ----- */
  const form = document.getElementById('contact-form');
  if (form) {
    const validators = {
      name: function (v) { return v.trim().length >= 2; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      phone: function (v) { return v.replace(/\D/g, '').length >= 10; },
      service: function (v) { return v.trim().length > 0; },
      city: function (v) { return v.trim().length >= 2; },
      message: function (v) { return v.trim().length >= 10; }
    };

    Object.keys(validators).forEach(function (name) {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener('blur', function () {
        if (field.value && !validators[name](field.value)) {
          field.classList.add('invalid');
        } else {
          field.classList.remove('invalid');
        }
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('invalid') && validators[name](field.value)) {
          field.classList.remove('invalid');
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;
      Object.keys(validators).forEach(function (name) {
        const field = form.elements[name];
        if (!field) return;
        if (!validators[name](field.value)) {
          field.classList.add('invalid');
          valid = false;
        } else {
          field.classList.remove('invalid');
        }
      });

      if (!valid) {
        e.stopImmediatePropagation();
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
    });
  }
})();
