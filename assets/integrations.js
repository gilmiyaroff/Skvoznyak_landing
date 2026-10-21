/* Soft depth movement for the integration cloud. No dependencies. */
(() => {
  const scene = document.querySelector('[data-integrations-scene]');
  if (!scene) return;
  const chips = Array.from(scene.querySelectorAll('[data-integration-item]'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let scheduled = false;
  const clear = () => chips.forEach(node => {
    node.style.removeProperty('--px');
    node.style.removeProperty('--py');
  });
  const update = () => {
    scheduled = false;
    if (!visible || reduced.matches) {
      if (reduced.matches) clear();
      return;
    }
    const rect = scene.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const distance = (viewport / 2 - (rect.top + rect.height / 2)) / (viewport + rect.height);
    const progress = Math.max(-1, Math.min(1, distance * 2));
    const mobile = window.matchMedia('(max-width: 980px)').matches;
    for (let i = 0; i < chips.length; i += 1) {
      const node = chips[i];
      const depth = Number(node.dataset.depth) || 1;
      const polarity = i % 2 ? -1 : 1;
      const px = mobile ? 0 : Math.round(progress * polarity * depth * 5);
      const py = Math.round(progress * depth * (mobile ? 4 : 12));
      node.style.setProperty('--px', px + 'px');
      node.style.setProperty('--py', py + 'px');
    }
  };
  const tick = () => {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(update);
    }
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) tick();
    }, { rootMargin: '80px 0px' });
    observer.observe(scene);
  } else {
    visible = true;
  }
  window.addEventListener('scroll', tick, { passive:true });
  window.addEventListener('resize', tick, { passive:true });
  reduced.addEventListener?.('change', () => {
    if (reduced.matches) clear();
    else tick();
  });
  tick();
})();
