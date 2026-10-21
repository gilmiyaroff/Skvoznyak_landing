/* SKVOZNYAK integration groups — one-shot reveal, then remain still. */
(() => {
  const scene = document.querySelector('[data-integrations-scene]');
  if (!scene || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const groups = Array.from(scene.querySelectorAll('[data-integration-group]'));
  if (!groups.length) return;

  groups.forEach(group => {
    group.querySelectorAll('.integration-chip__inner').forEach((chip, index) => {
      chip.style.setProperty('--reveal-delay', (80 + index * 85) + 'ms');
    });
  });

  scene.classList.add('integration-motion-enabled');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px 40px 0px' });
  groups.forEach(group => observer.observe(group));
})();
