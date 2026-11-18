// iBIM Navigation, Video Loader, and Form Validation/Submission
(() => {
  // Mobile Sheet Navigation (5.5)
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileSheet = document.querySelector('[data-mobile-sheet]');
  const mobileClose = document.querySelector('[data-mobile-close]');

  const openMobileMenu = () => {
    if (!mobileSheet) return;
    mobileSheet.classList.add('is-open');
    mobileSheet.setAttribute('aria-hidden', 'false');
    mobileSheet.inert = false;
    mobileToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileClose?.focus();
  };

  const closeMobileMenu = () => {
    if (!mobileSheet) return;
    mobileSheet.classList.remove('is-open');
    mobileSheet.setAttribute('aria-hidden', 'true');
    mobileSheet.inert = true;
    mobileToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    mobileToggle?.focus();
  };

  mobileToggle?.addEventListener('click', openMobileMenu);
  mobileClose?.addEventListener('click', closeMobileMenu);

  // Close mobile sheet when a navigation link is clicked
  mobileSheet?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Desktop Dropdowns
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  document.addEventListener('click', (e) => {
    dropdowns.forEach((d) => {
      if (d.open && !d.contains(e.target)) {
        d.open = false;
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileSheet && mobileSheet.classList.contains('is-open')) {
        closeMobileMenu();
      }
      dropdowns.forEach((d) => {
        if (d.open) {
          d.open = false;
          d.querySelector('summary')?.focus();
        }
      });
    }
  });

  // Click-to-load YouTube Video
  document.querySelectorAll('[data-video]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.video}?autoplay=1&rel=0`;
      frame.title = 'iBIM video about BIM';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      frame.className = 'video__frame';
      btn.replaceWith(frame);
    });
  });

  // Validation helpers
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValidUKPhone = (val) => val.replace(/\D/g, '').length >= 10;

  // Form Submission
  document.querySelectorAll('[data-enquiry]').forEach((form) => {
    const status = form.querySelector('[data-status]');
    const showStatus = (text, kind) => {
      if (!status) return;
      status.hidden = false;
      status.textContent = text;
      status.dataset.kind = kind;
    };

    const fail = (message, fieldNames = []) => {
      showStatus(message, 'error');
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      fieldNames.forEach((name) => {
        const field = form.elements[name];
        if (field) field.setAttribute('aria-invalid', 'true');
      });
      if (fieldNames[0] && form.elements[fieldNames[0]]) {
        form.elements[fieldNames[0]].focus();
      }
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const kind = form.dataset.kind;

      // Contact form validation (four-field form)
      if (kind === 'contact') {
        const replyField = form.elements['reply'];
        const replyVal = replyField ? replyField.value.trim() : '';

        if (!replyVal) {
          return fail('Please enter an email address or a phone number so we can reply.', ['reply']);
        }
        if (!isValidEmail(replyVal) && !isValidUKPhone(replyVal)) {
          return fail('Please enter a valid email address or a UK phone number with at least 10 digits.', ['reply']);
        }
      } else {
        // Waitlist validation
        const required = ['first_name', 'last_name', 'company', 'job_title', 'email'];
        const missing = required.filter((name) => !form.elements[name]?.value.trim());
        if (missing.length) {
          return fail('Please fill in all required fields and try again.', missing);
        }
        if (!isValidEmail(form.elements['email'].value.trim())) {
          return fail('Please enter a valid work email address.', ['email']);
        }
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      showStatus('Sending enquiry…', 'pending');

      try {
        const from = document.referrer ? new URL(document.referrer).hostname : '';
        if (form.elements['referrer']) {
          form.elements['referrer'].value = from === location.hostname ? '' : from;
        }
      } catch {
        /* Ignore malformed referrer */
      }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          return fail(body.error || 'The message could not be sent. Please call +44 7825 885167 or email jack@i-bim.co.uk.', body.missing);
        }

        form.reset();
        form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
        showStatus(form.dataset.success || 'Thank you. Message sent.', 'ok');
      } catch {
        fail('The message could not be sent. Please check your connection, or call +44 7825 885167.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
})();
