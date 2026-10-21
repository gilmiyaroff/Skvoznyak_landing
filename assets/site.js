(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  menuButton?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  // Preserve the current section while switching locales. On Pages preview URLs,
  // keep navigation inside the preview deployment rather than jumping to production.
  const isPreview = !/^(?:www\.)?skvoznyak\.(?:kz|com)$/i.test(location.hostname);
  const inPrivacy = /^\/(?:en\/|kz\/)?privacy\/?(?:index\.html)?$/.test(location.pathname);
  const localePaths = inPrivacy
    ? { kk: '/kz/privacy/', ru: '/privacy/', en: '/en/privacy/' }
    : { kk: '/kz/', ru: '/', en: '/en/' };
  document.querySelectorAll('.language-switch a').forEach(link => {
    const target = link.getAttribute('lang');
    if (isPreview && localePaths[target]) link.href = localePaths[target];
    link.addEventListener('click', () => {
      if (location.hash && /^#(?:features|how|pricing|faq|contact)$/.test(location.hash)) {
        const url = new URL(link.href);
        url.hash = location.hash;
        link.href = url.href;
      }
    });
  });

  const form = document.querySelector('[data-lead-form]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[type=submit]');
  const messages = {
    ru: {
      phone: 'Укажите корректный номер телефона.',
      sending: 'Отправляем заявку…',
      success: 'Заявка отправлена! Мы с вами свяжемся.',
      failed: 'Форма временно недоступна. Пожалуйста, попробуйте позже.'
    },
    kk: {
      phone: 'Телефон нөмірін дұрыс енгізіңіз.',
      sending: 'Өтінім жіберіліп жатыр…',
      success: 'Өтінім жіберілді! Біз сізге хабарласамыз.',
      failed: 'Өтінім жіберу уақытша қолжетімсіз. Кейінірек қайталап көріңіз.'
    },
    en: {
      phone: 'Please enter a valid phone number.',
      sending: 'Sending your request…',
      success: 'Your request was sent. We will contact you.',
      failed: 'The form is temporarily unavailable. Please try again later.'
    }
  };
  const t = messages[document.documentElement.lang] || messages.ru;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const phone = String(data.get('phone') || '').trim();
    if (!/^\+?[\d\s()+-]{8,25}$/.test(phone)) {
      status.className = 'form-message error';
      status.textContent = t.phone;
      return;
    }
    submit.disabled = true;
    status.className = 'form-message';
    status.textContent = t.sending;
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') || '').trim(),
          phone,
          company: String(data.get('company') || '').trim(),
          consent: data.get('consent') === 'on',
          interest: String(data.get('interest') || ''),
          website: String(data.get('website') || ''),
          locale: document.documentElement.lang,
          page: window.location.href
        })
      });
      if (!response.ok) throw new Error('Form service is not ready');
      const result = await response.json();
      if (!result.ok) throw new Error('Form service rejected the request');
      status.className = 'form-message success';
      status.textContent = t.success;
      form.reset();
    } catch (err) {
      status.className = 'form-message error';
      status.textContent = t.failed;
    } finally {
      submit.disabled = false;
    }
  });
})();
