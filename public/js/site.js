// Navigation, click-to-load video, and form submission. The site works without this file.
(() => {
  const menu = document.querySelector('[data-menu]');
  const sub = document.querySelector('[data-sub]');
  const desktop = matchMedia('(min-width: 860px)');
  const syncMenu = () => {
    if (menu) menu.open = desktop.matches;
    if (sub && desktop.matches) sub.open = false;
  };
  syncMenu();
  desktop.addEventListener('change', syncMenu);
  document.addEventListener('click', (e) => {
    if (desktop.matches && sub && sub.open && !sub.contains(e.target)) sub.open = false;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sub && sub.open) { sub.open = false; sub.querySelector('summary').focus(); }
  });

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

  document.querySelectorAll('[data-enquiry]').forEach((form) => {
    const status = form.querySelector('[data-status]');
    const show = (text, kind) => {
      status.hidden = false;
      status.textContent = text;
      status.dataset.kind = kind;
    };
    const fail = (message, fields = []) => {
      show(message, 'error');
      form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
      fields.forEach((name) => form.elements[name]?.setAttribute('aria-invalid', 'true'));
      form.elements[fields[0]]?.focus();
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity()).map((el) => el.name);
      if (invalid.length) {
        const emailOnly = invalid.length === 1 && invalid[0] === 'email' && form.elements.email.value;
        return fail(emailOnly ? 'Enter a valid email address.' : 'Fill in the required fields and send the form again.', invalid);
      }
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      show('Sending…', 'pending');
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) return fail(body.error || 'The message didn’t send. Call +44 7825 885167 or email jack@i-bim.co.uk.', body.missing);
        form.reset();
        form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
        show(form.dataset.success, 'ok');
      } catch {
        fail('The message didn’t send. Check your connection, or call +44 7825 885167.');
      } finally {
        button.disabled = false;
      }
    });
  });
})();
