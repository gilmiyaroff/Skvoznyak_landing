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
  const inPrivacy = /^\/(?:en\/|ru\/)?privacy\/?(?:index\.html)?$/.test(location.pathname);
  const inGptAds = /^\/gptads(?:\/(?:ru|en))?\/?(?:index\.html)?$/.test(location.pathname);
  const localePaths = inPrivacy
    ? { kk: '/privacy/', ru: '/ru/privacy/', en: '/en/privacy/' }
    : inGptAds
      ? { kk: '/gptads/', ru: '/gptads/ru/', en: '/gptads/en/' }
      : { kk: '/', ru: '/ru/', en: '/en/' };
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

  // Product showcase: synchronized accessible tabs and an enlarged desktop screenshot.
  const tabs = [...document.querySelectorAll('[data-screen-tab]')];
  const screenImage = document.querySelector('[data-screen-image]');
  const screenRoute = document.querySelector('[data-screen-route]');
  const screenCaption = document.querySelector('[data-screen-caption]');
  const screenPanel = document.querySelector('[data-screen-panel]');
  const screenDialog = document.querySelector('[data-screen-dialog]');
  const dialogImage = document.querySelector('[data-screen-dialog-image]');
  const zoom = document.querySelector('[data-screen-open]');
  const closeZoom = document.querySelector('[data-screen-close]');
  if (screenImage && tabs.length) {
    const selectScreen = (button) => {
      const key = button.dataset.screenTab;
      const src = key === 'ads' ? screenImage.dataset.adsSrc : screenImage.dataset.overviewSrc;
      const alt = key === 'ads' ? screenImage.dataset.altAds : screenImage.dataset.altOverview;
      screenImage.src = src;
      screenImage.alt = alt;
      if (screenCaption) screenCaption.textContent = button.dataset.caption;
      if (screenRoute) screenRoute.textContent = button.dataset.url;
      if (screenPanel) screenPanel.setAttribute('aria-labelledby', button.id);
      tabs.forEach(tab => {
        const active = tab === button;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectScreen(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
          (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        selectScreen(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });
    zoom?.addEventListener('click', () => {
      if (!screenDialog || !dialogImage || typeof screenDialog.showModal !== 'function') return;
      dialogImage.src = screenImage.src;
      dialogImage.alt = screenImage.alt;
      screenDialog.showModal();
    });
    closeZoom?.addEventListener('click', () => screenDialog?.close());
    screenDialog?.addEventListener('click', e => { if (e.target === screenDialog) screenDialog.close(); });
  }

  // Scroll reveals for main landing pages. Disabled when reduced motion is requested.
  // Content stays visible when JavaScript/IntersectionObserver is unavailable.
  const hasLandingSections = document.querySelector('.section-features') && document.querySelector('.product-showcase');
  const prefersReducedMotion = typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hasLandingSections && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const selectors = [
      '.section .eyebrow',
      '.section h2',
      '.section .section-lead',
      '.problem-card',
      '.flow-step',
      '.feature-card',
      '.timeline-top',
      '.timeline-event',
      '.screen-switcher',
      '.screen-stage',
      '.screen-description',
      '.quote-panel .button',
      '.faq-list details',
      '.cta-points li',
      '.lead-form'
    ];
    const elements = [...document.querySelectorAll(selectors.join(', '))];
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target); // Animate once; no flicker on scroll back.
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });

    // Short stagger across rows and headings without changing the document flow.
    document.querySelectorAll('.problem-grid, .flow, .features-grid, .faq-list, .cta-points, .timeline').forEach(group => {
      [...group.children].forEach((item, index) => {
        item.style.setProperty('--reveal-delay', Math.min(index % 3, 2) * 75 + 'ms');
      });
    });
    elements.forEach(element => {
      if (element.matches('.section h2')) element.style.setProperty('--reveal-delay', '65ms');
      if (element.matches('.section .section-lead')) element.style.setProperty('--reveal-delay', '115ms');
      if (element.matches('.screen-stage, .lead-form')) element.style.setProperty('--reveal-delay', '90ms');
      element.classList.add('reveal-item');
      const rect = element.getBoundingClientRect();
      // Do not make elements already on screen disappear during initialization.
      if (rect.top < window.innerHeight * 0.93 && rect.bottom > 0) {
        element.classList.add('is-visible');
      } else {
        observer.observe(element);
      }
    });
    document.documentElement.classList.add('has-scroll-reveal');
  }


  // GPT Ads reveal and intro animations — isolated from the SKVOZNYAK main landing.
  // Progressive enhancement: no hidden content when JS or IntersectionObserver is unavailable.
  if (document.body.classList.contains('gpt-page') &&
      !prefersReducedMotion && 'IntersectionObserver' in window) {
    const introTargets = [
      '.gpt-hero .gpt-pill',
      '.gpt-hero h1',
      '.gpt-hero .hero-desc',
      '.gpt-hero .hero-actions',
      '.gpt-hero .gpt-mini-benefits',
      '.gpt-hero-grid > div:last-child'
    ];
    introTargets.forEach((selector, index) => {
      const item = document.querySelector(selector);
      if (!item) return;
      item.style.setProperty('--gpt-delay', (index * 90 + 60) + 'ms');
      item.classList.add('gpt-intro-item');
    });

    const gptRevealSelectors = [
      '#benefits .gpt-section-heading > *',
      '#benefits .gpt-benefit',
      '#service .gpt-section-heading > *',
      '#service .gpt-service',
      '#steps .gpt-section-heading > *',
      '#steps .gpt-step',
      '#budget .gpt-section-heading > *',
      '#budget .gpt-budget-card',
      '#budget .gpt-budget-under > *',
      '#budget .gpt-audience',
      '.gpt-fee .gpt-quote',
      '.gpt-faq-layout > div:first-child > *',
      '.gpt-faq details',
      '.gpt-contact .cta-intro > *',
      '.gpt-contact .lead-form'
    ];
    const targets = [...document.querySelectorAll(gptRevealSelectors.join(', '))];
    const revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('gpt-is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    const staggerGroups = [
      '.gpt-benefit-grid',
      '.gpt-service-grid',
      '.gpt-steps',
      '.gpt-budget-cards',
      '.gpt-faq-layout',
      '.gpt-contact .cta-points'
    ];
    staggerGroups.forEach(selector => {
      const group = document.querySelector(selector);
      if (!group) return;
      [...group.children].forEach((item, index) => {
        item.style.setProperty('--gpt-reveal-delay', (index % 4) * 85 + 'ms');
      });
    });

    for (const element of targets) {
      if (element.matches('.gpt-section-heading h2, .gpt-faq-layout h2')) {
        element.style.setProperty('--gpt-reveal-delay', '65ms');
      } else if (element.matches('.gpt-section-heading .section-lead')) {
        element.style.setProperty('--gpt-reveal-delay', '120ms');
      }
      const rect = element.getBoundingClientRect();
      element.classList.add('gpt-reveal-item');
      // Anything already on screen must never flash from visible to hidden.
      if (rect.top <= window.innerHeight * 0.94 && rect.bottom >= 0) {
        element.classList.add('gpt-is-visible');
      } else {
        revealObserver.observe(element);
      }
    }
    document.body.classList.add('has-gpt-motion');
  }

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
