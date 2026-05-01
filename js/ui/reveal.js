import { $$ } from '../core/dom.js';

export function startRevealAnimations() {
  const elements = $$('.reveal:not(.is-visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
    observer.observe(element);
  });
}
