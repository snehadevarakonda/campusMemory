// Campus Memories — Landing page interactions

(() => {
  const loader = document.getElementById('lpLoader');
  const nav = document.getElementById('lpNav');
  const carousel = document.getElementById('lpCarousel');
  const dotsWrap = document.getElementById('lpCarouselDots');

  // Loader
  window.addEventListener('load', () => {
    setTimeout(() => loader?.classList.add('hidden'), 600);
  });

  // Navbar scroll state
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal
  const revealEls = document.querySelectorAll('.lp-reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Number(el.dataset.delay || 0) * 100;
        setTimeout(() => el.classList.add('visible'), delay);
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Stagger preview cards
  document.querySelectorAll('.lp-preview-card').forEach((card, i) => {
    card.dataset.delay = String(i);
  });

  // Testimonial carousel
  if (carousel && dotsWrap) {
    const slides = carousel.querySelectorAll('.lp-testimonial');
    let index = 0;
    let timer;

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      const slide = slides[0];
      const gap = 20;
      const width = slide ? slide.offsetWidth + gap : 400;
      carousel.style.transform = `translateX(-${index * width}px)`;
      dotsWrap.querySelectorAll('button').forEach((btn, j) => {
        btn.classList.toggle('active', j === index);
      });
    };

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goTo(i);
        resetTimer();
      });
      dotsWrap.appendChild(dot);
    });

    const next = () => goTo(index + 1);
    const resetTimer = () => {
      clearInterval(timer);
      timer = setInterval(next, 5000);
    };

    resetTimer();
    window.addEventListener('resize', () => goTo(index));
  }

  // Redirect if already logged in
  if (typeof redirectIfAuth === 'function') redirectIfAuth();
})();
