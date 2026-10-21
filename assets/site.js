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

  const form = document.querySelector('[data-lead-form]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[type=submit]');
  const english = document.documentElement.lang === 'en';

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const phone = String(data.get('phone') || '').trim();
    if (!/^\+?[\d\s()+-]{8,25}$/.test(phone)) {
      status.className = 'form-message error';
      status.textContent = english ? 'Please enter a valid phone number.' : 'Укажите корректный номер телефона.';
      return;
    }
    submit.disabled = true;
    status.className = 'form-message';
    status.textContent = english ? 'Sending your request…' : 'Отправляем заявку…';
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
      status.textContent = english ? 'Your request was sent. We will contact you.' : 'Заявка отправлена! Мы с вами свяжемся.';
      form.reset();
    } catch (err) {
      status.className = 'form-message error';
      status.textContent = english
        ? 'The form is temporarily unavailable. Please try again later.'
        : 'Форма временно недоступна. Пожалуйста, попробуйте позже.';
    } finally {
      submit.disabled = false;
    }
  });
})();
