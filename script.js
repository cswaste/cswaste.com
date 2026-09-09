// Basic interactivity: mobile menu, modal quote form, simple client-side validation + Netlify-friendly submit UX.

document.addEventListener('DOMContentLoaded', function() {
  // mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
      // for CSS: toggles menu via attribute
      if (this.getAttribute('aria-expanded') === 'true') {
        mainNav.style.display = 'flex';
        mainNav.style.flexDirection = 'column';
      } else {
        mainNav.style.display = '';
      }
    });
  }

  // modal logic
  const quoteModal = document.getElementById('quoteModal');
  const openQuoteBtns = document.querySelectorAll('#openQuote, #openQuoteCTA, #openQuote2, .open-quick');
  const closeModal = document.getElementById('closeModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCancel = document.getElementById('modalCancel');
  const form = document.getElementById('quoteForm');
  const formStatus = document.getElementById('formStatus');

  function showModal(preselect) {
    if (!quoteModal) return;
    quoteModal.setAttribute('aria-hidden', 'false');
    quoteModal.style.display = 'flex';
    // preselect plan if provided
    if (preselect && form) {
      const sel = form.querySelector('select[name="rental_option"]');
      if (sel) sel.value = preselect;
    }
    // focus the first input
    setTimeout(() => {
      const first = quoteModal.querySelector('input, textarea, select, button');
      if (first) first.focus();
    }, 120);
    // trap focus lightly (basic)
    document.addEventListener('keydown', handleEsc);
  }

  function hideModal() {
    if (!quoteModal) return;
    quoteModal.setAttribute('aria-hidden', 'true');
    quoteModal.style.display = 'none';
    document.removeEventListener('keydown', handleEsc);
    formStatus.textContent = '';
  }

  function handleEsc(e) {
    if (e.key === 'Escape') hideModal();
  }

  openQuoteBtns.forEach(b => {
    b.addEventListener('click', function(e){
      const plan = this.dataset ? this.dataset.plan : null;
      showModal(plan || '');
    });
  });

  if (closeModal) closeModal.addEventListener('click', hideModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', hideModal);
  if (modalCancel) modalCancel.addEventListener('click', hideModal);

  // Provide phone call button
  const callBtn = document.getElementById('callUs');
  if (callBtn) callBtn.addEventListener('click', function() {
    window.location.href = 'tel:7405007367';
  });

  // Netlify-compatible AJAX submit for nicer UX (progress + message). Netlify still receives form post as fallback if JS disabled.
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      formStatus.textContent = 'Sending…';
      const formData = new FormData(form);

      // Basic client side validation: ensure required fields filled
      const required = form.querySelectorAll('[required]');
      for (let el of required) {
        if (!el.value) {
          formStatus.textContent = 'Please fill out all required fields.';
          el.focus();
          return;
        }
      }

      // Post to Netlify (same origin). If you're not using Netlify, change to a Formspree or backend endpoint.
      fetch('/', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      }).then(res => {
        if (res.ok) {
          formStatus.textContent = 'Thanks — we received your request. We will call or text to confirm.';
          form.reset();
          setTimeout(hideModal, 1800);
        } else {
          return res.text().then(txt => { throw new Error(txt || 'Network error'); });
        }
      }).catch(err => {
        console.warn('Form submit error', err);
        // If fetch fails (CORS or not Netlify), fallback to non-AJAX submit
        formStatus.textContent = 'Unable to send via AJAX — submitting normally...';
        setTimeout(() => form.submit(), 900);
      });
    });
  }

  // Quick open contractor contact
  const contractorContact = document.getElementById('contractorContact');
  if (contractorContact) contractorContact.addEventListener('click', ()=> showModal(''));

  // Set current year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
