/* ==========================================================================
   CLEARWATER PLUMBING — FORMS.JS
   Client-side validation + success state (no backend submission)
   ========================================================================== */
(function () {
  'use strict';

  const form = document.querySelector('#estimate-form');
  if (!form) return;

  const validators = {
    name: (v) => v.trim().length > 1 || 'Please enter your name.',
    phone: (v) => /^[\d\s()+-]{7,}$/.test(v.trim()) || 'Please enter a valid phone number.',
    email: (v) => (v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) || 'Please enter a valid email address.',
    address: (v) => v.trim().length > 3 || 'Please enter your service address.',
    service: (v) => v.trim() !== '' || 'Please select a service.',
    message: () => true,
    date: () => true,
  };

  function showError(field, message) {
    const wrap = field.closest('.field');
    const errorEl = wrap.querySelector('.field-error');
    if (message === true) {
      wrap.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
    wrap.classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
    return false;
  }

  function validateField(field) {
    const rule = validators[field.name];
    if (!rule) return true;
    const result = rule(field.value);
    return showError(field, result);
  }

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.field').classList.contains('has-error')) validateField(field);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      if (!validateField(field)) valid = false;
    });
    if (!valid) {
      form.querySelector('.has-error input, .has-error select, .has-error textarea')?.focus();
      return;
    }

    /* No backend is connected — this simply demonstrates a success state. */
    const wrapper = document.querySelector('.contact-form');
    wrapper.classList.add('is-submitted');
    const success = wrapper.querySelector('.form-success');
    if (success) {
      success.classList.add('is-visible');
      success.setAttribute('tabindex', '-1');
      success.focus();
    }
    form.reset();
  });
})();
