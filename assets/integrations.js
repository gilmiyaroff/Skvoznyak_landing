/* SKVOZNYAK integration groups — one-shot reveal, then remain still. */
(() => {
  const scene = document.querySelector('[data-integrations-scene]');
  if (!scene) return;

  // Read the single connector status map; do not hardcode statuses in page HTML.
  const config = window.SKVOZNYAK_CONNECTORS;
  const locale = document.documentElement.lang;
  const labels = config?.labels?.[locale] || config?.labels?.ru;
  scene.querySelectorAll('[data-integration-item]').forEach(chip => {
    const matched = [...chip.classList].find(name => name.startsWith('integration-chip--'));
    const id = matched?.replace('integration-chip--', '');
    const state = config?.statuses?.[id];
    if (!state || !['development','pilot'].includes(state) || !labels) return;
    const inner = chip.querySelector('.integration-chip__inner');
    if (!inner || inner.querySelector('.integration-status')) return;
    const badge = document.createElement('span');
    badge.className = 'integration-status integration-status--' + state;
    badge.textContent = labels[state];
    badge.setAttribute('data-status', state);
    inner.appendChild(badge);
  });

  if (!('IntersectionObserver' in window)) return;
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
