/* ============================================
   VR CONSTRUCCIONES - Main JS
   Animations, interactions, smooth scroll
   ============================================ */

// --- Lenis Smooth Scroll ---
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// --- Loader ---
function initLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) {
    initAnimations();
    return;
  }

  const logo = loader.querySelector('.loader__logo');
  const barInner = loader.querySelector('.loader__bar-inner');
  const counter = loader.querySelector('.loader__counter');

  const tl = gsap.timeline({
    onComplete: () => {
      loader.classList.add('is-hidden');
      document.body.style.overflow = '';
      initAnimations();
      initHeroAnimation();
    }
  });

  document.body.style.overflow = 'hidden';

  tl.to(logo, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out'
  })
  .to(counter, {
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out'
  }, '-=0.3')
  .to(barInner, {
    width: '100%',
    duration: 2,
    ease: 'power2.inOut',
    onUpdate: function() {
      const progress = Math.round(this.progress() * 100);
      counter.textContent = progress + '%';
    }
  }, '-=0.2')
  .to([logo, counter, barInner.parentElement], {
    opacity: 0,
    y: -20,
    duration: 0.5,
    stagger: 0.05,
    ease: 'power2.in'
  }, '+=0.3');
}

// --- Hero Animation ---
function initHeroAnimation() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const bgImage = hero.querySelector('.hero__bg-image');
  const label = hero.querySelector('.hero__label');
  const lineInners = hero.querySelectorAll('.hero__title .line-inner');
  const description = hero.querySelector('.hero__description');
  const scroll = hero.querySelector('.hero__scroll');

  const tl = gsap.timeline({ delay: 0.2 });

  if (bgImage) {
    tl.to(bgImage, {
      scale: 1,
      duration: 1.8,
      ease: 'power3.out'
    }, 0);
  }

  if (label) {
    tl.fromTo(label,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      0.5
    );
  }

  if (lineInners.length) {
    tl.to(lineInners, {
      y: '0%',
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out'
    }, 0.6);
  }

  if (description) {
    tl.fromTo(description,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      1.2
    );
  }

  if (scroll) {
    tl.fromTo(scroll,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' },
      1.5
    );
  }
}

// --- Scroll Reveal Animations ---
function initAnimations() {
  // Reveal elements on scroll
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('is-visible'),
      once: true
    });
  });

  // Reveal lines
  const revealLines = document.querySelectorAll('.reveal-line');
  revealLines.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('is-visible'),
      once: true
    });
  });

  // Image reveals
  const imgReveals = document.querySelectorAll('.img-reveal');
  imgReveals.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      onEnter: () => el.classList.add('is-visible'),
      once: true
    });
  });

  // Parallax images
  const parallaxImgs = document.querySelectorAll('.parallax-img img');
  parallaxImgs.forEach((img) => {
    gsap.to(img, {
      y: '10%',
      ease: 'none',
      scrollTrigger: {
        trigger: img.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // Text split animations for large headings
  const animatedHeadings = document.querySelectorAll('[data-animate="heading"]');
  animatedHeadings.forEach((heading) => {
    const lines = heading.querySelectorAll('.line-inner');
    if (lines.length) {
      gsap.fromTo(lines,
        { y: '100%' },
        {
          y: '0%',
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            once: true
          }
        }
      );
    }
  });

  // Stagger children
  const staggerGroups = document.querySelectorAll('[data-animate="stagger"]');
  staggerGroups.forEach((group) => {
    const children = group.children;
    gsap.fromTo(children,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 80%',
          once: true
        }
      }
    );
  });

  // Counter animation for stats
  const statNumbers = document.querySelectorAll('[data-count]');
  statNumbers.forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(el,
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function() {
              el.textContent = prefix + Math.round(gsap.getProperty(el, 'innerText')) + suffix;
            }
          }
        );
      }
    });
  });
}

// --- Navigation ---
function initNavigation() {
  const nav = document.querySelector('.nav');
  const menuBtn = document.querySelector('.nav__menu-btn');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuLinks = document.querySelectorAll('.menu-overlay__link');
  const menuInfo = document.querySelector('.menu-overlay__info');

  if (!nav) return;

  // Scroll behavior
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = currentScroll;
  });

  // Menu toggle
  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuOverlay.classList.contains('is-open');

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on link click
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    function openMenu() {
      nav.classList.add('menu-open');
      menuOverlay.classList.add('is-open');
      lenis.stop();

      // Animate links
      gsap.fromTo(menuLinks,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 0.2
        }
      );

      // Animate info
      if (menuInfo) {
        gsap.fromTo(menuInfo,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            delay: 0.5
          }
        );
      }
    }

    function closeMenu() {
      nav.classList.remove('menu-open');

      gsap.to(menuLinks, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.in',
        onComplete: () => {
          menuOverlay.classList.remove('is-open');
          lenis.start();
        }
      });

      if (menuInfo) {
        gsap.to(menuInfo, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          ease: 'power2.in'
        });
      }
    }
  }
}

// --- Project Carousel ---
function initCarousel() {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel__track');
    const slides = carousel.querySelectorAll('.carousel__slide');
    const prevBtn = carousel.querySelector('.carousel__btn--prev');
    const nextBtn = carousel.querySelector('.carousel__btn--next');
    const counter = carousel.querySelector('.carousel__counter');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    const isHalf = slides[0].classList.contains('carousel__slide--half');

    function updateCarousel() {
      if (isHalf) {
        const slideWidth = slides[0].offsetWidth;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      } else {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }

      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : totalSlides - 1;
        updateCarousel();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = currentIndex < totalSlides - 1 ? currentIndex + 1 : 0;
        updateCarousel();
      });
    }

    // Touch/swipe support
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          currentIndex = currentIndex < totalSlides - 1 ? currentIndex + 1 : 0;
        } else {
          currentIndex = currentIndex > 0 ? currentIndex - 1 : totalSlides - 1;
        }
        updateCarousel();
      }
      isDragging = false;
    }, { passive: true });

    updateCarousel();
  });
}

// --- Accordion ---
function initAccordion() {
  const items = document.querySelectorAll('.accordion__item');

  items.forEach(item => {
    const header = item.querySelector('.accordion__header');
    const body = item.querySelector('.accordion__body');

    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all others
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          const otherBody = other.querySelector('.accordion__body');
          if (otherBody) otherBody.style.maxHeight = '0';
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        body.style.maxHeight = '0';
      } else {
        item.classList.add('is-open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

// --- Contact Form ---
function initContactForm() {
  const form = document.querySelector('.form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    // Simulate submission
    setTimeout(() => {
      btn.textContent = 'Enviado!';
      form.reset();

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    }, 1500);
  });
}

// --- Back to Top ---
function initBackToTop() {
  const backTopBtn = document.querySelector('.footer__back-top');
  if (!backTopBtn) return;

  backTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo(0, { duration: 2 });
  });
}

// --- Category Filters ---
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.journal-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const category = btn.getAttribute('data-filter');

      cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          gsap.to(card, {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
            onStart: () => { card.style.display = ''; }
          });
        } else {
          gsap.to(card, {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => { card.style.display = 'none'; }
          });
        }
      });
    });
  });
}

// --- Page Hero Animation (for internal pages) ---
function initPageHero() {
  const pageHero = document.querySelector('.page-hero');
  if (!pageHero) return;

  const bgImage = pageHero.querySelector('.page-hero__bg-image');
  const label = pageHero.querySelector('.page-hero__label');
  const title = pageHero.querySelector('.page-hero__title');

  const tl = gsap.timeline({ delay: 0.5 });

  if (bgImage) {
    gsap.fromTo(bgImage,
      { scale: 1.15 },
      { scale: 1, duration: 1.8, ease: 'power3.out' }
    );
  }

  if (label) {
    tl.fromTo(label,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      0
    );
  }

  if (title) {
    const lines = title.querySelectorAll('.line-inner');
    if (lines.length) {
      tl.fromTo(lines,
        { y: '100%' },
        { y: '0%', duration: 1, stagger: 0.1, ease: 'power3.out' },
        0.2
      );
    } else {
      tl.fromTo(title,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        0.2
      );
    }
  }
}

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNavigation();
  initCarousel();
  initAccordion();
  initContactForm();
  initBackToTop();
  initFilters();
  initPageHero();
});
