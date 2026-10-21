/* Visible on-scroll reveal and a restrained parallax for the integrations grid. */
(() => {
  const scene = document.querySelector('[data-integrations-scene]');
  if (!scene) return;
  const groups = Array.from(scene.querySelectorAll('[data-integration-group]'));
  const chips = Array.from(scene.querySelectorAll('[data-integration-item]'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.05, rootMargin: '0px 0px 48px 0px' });
    scene.classList.add('integration-motion-enabled');
    groups.forEach(group => observer.observe(group));
  }
  let scheduled = false;
  const update = () => {
    scheduled = false;
    if (reduced.matches) return;
    const r = scene.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.bottom < -100 || r.top > vh + 100) return;
    const progress = Math.max(-1, Math.min(1, (vh / 2 - r.top - r.height / 2) / Math.max(vh, r.height)));
    const mobile = window.matchMedia('(max-width: 680px)').matches;
    chips.forEach((chip, i) => {
      chip.style.setProperty('--scroll-shift', Math.round(progress * (mobile ? 4 : 14) * (i % 2 ? -1 : 1)) + 'px');
    });
    scene.style.setProperty('--glow-shift', Math.round(progress * 22) + 'px');
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener?.('change', () => {
    if (reduced.matches) {
      groups.forEach(group => group.classList.add('is-visible'));
      chips.forEach(chip => chip.style.removeProperty('--scroll-shift'));
    } else schedule();
  });
  schedule();
})();
