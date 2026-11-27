/* ============================================
   VR CONSTRUCCIONES - Main JS
   Animations, interactions, smooth scroll
   ============================================ */

// --- Motion setup ---
// Animations need GSAP + ScrollTrigger and are skipped when the user prefers
// reduced motion. Without them, .no-anim shows every element in its final state.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasAnimLibs = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const animate = hasAnimLibs && !prefersReducedMotion;

if (animate) {
  gsap.registerPlugin(ScrollTrigger);
} else {
  document.documentElement.classList.add('no-anim');
}

// --- Lenis Smooth Scroll ---
let lenis = null;

if (animate && typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  // GSAP's ticker drives Lenis, so there is a single animation loop
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 2 });
  } else {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }
}

// --- Text wipe ---
// Texts appear with a left-to-right sweep (same language as the logo's R).
// The clip is removed at the end so focus outlines and descenders aren't cut.
const WIPE_FROM = { clipPath: 'inset(-15% 100% -15% 0%)', x: -16, opacity: 0 };
const WIPE_TO = {
  clipPath: 'inset(-15% -5% -15% 0%)',
  x: 0,
  opacity: 1,
  ease: 'power3.inOut',
  onComplete() {
    // Inline "none" beats any hidden starting clip set in CSS
    this.targets().forEach((el) => { el.style.clipPath = 'none'; });
  },
};

// --- Loader ---
function initLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) {
    initAnimations();
    return;
  }

  // The intro plays once per visit; later visits to the home skip it
  let seenLoader = false;
  try {
    seenLoader = sessionStorage.getItem('vr-loader-seen') === '1';
    sessionStorage.setItem('vr-loader-seen', '1');
  } catch (e) {}

  if (seenLoader) {
    loader.classList.add('is-hidden');
    initAnimations();
    initHeroAnimation();
    return;
  }

  const logo = loader.querySelector('.loader__logo');
  const barInner = loader.querySelector('.loader__bar-inner');
  const counter = loader.querySelector('.loader__counter');
  const wipe = loader.querySelector('.loader__wipe');
  const markFoot = loader.querySelector('.loader__mark-foot');
  const word = loader.querySelector('.loader__word');

  const tl = gsap.timeline({
    onComplete: () => {
      loader.classList.add('is-hidden');
      document.body.style.overflow = '';
      initAnimations();
      initHeroAnimation();
    }
  });

  document.body.style.overflow = 'hidden';

  // The R is built while the bar fills: the body sweeps in, the foot drops,
  // then the name appears under it
  if (markFoot) gsap.set(markFoot, { y: -30, opacity: 0 });
  if (word) gsap.set(word, { y: 12, opacity: 0 });

  tl.to(logo, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out'
  })
  .to(counter, {
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out'
  }, '-=0.3')
  .addLabel('load', '-=0.2')
  .to(barInner, {
    width: '100%',
    duration: 2,
    ease: 'power2.inOut',
    onUpdate: function() {
      const progress = Math.round(this.progress() * 100);
      counter.textContent = progress + '%';
    }
  }, 'load');

  if (wipe) {
    tl.to(wipe, { attr: { width: 80 }, duration: 1.1, ease: 'power2.inOut' }, 'load');
  }
  if (markFoot) {
    tl.to(markFoot, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)' }, 'load+=1');
  }
  if (word) {
    tl.to(word, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 'load+=1.25');
  }

  tl.to([logo, counter, barInner.parentElement], {
    opacity: 0,
    y: -20,
    duration: 0.5,
    stagger: 0.05,
    ease: 'power2.in'
  }, 'load+=2.3');
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
    tl.fromTo(label, WIPE_FROM, { ...WIPE_TO, duration: 0.9 }, 0.5);
  }

  if (lineInners.length) {
    tl.fromTo(lineInners, WIPE_FROM, { ...WIPE_TO, duration: 1.1, stagger: 0.15 }, 0.6);
  }

  if (description) {
    tl.fromTo(description, WIPE_FROM, { ...WIPE_TO, duration: 1 }, 1.2);
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
      gsap.fromTo(lines, WIPE_FROM,
        {
          ...WIPE_TO,
          duration: 1.1,
          stagger: 0.12,
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
    gsap.fromTo(children, WIPE_FROM,
      {
        ...WIPE_TO,
        duration: 0.9,
        stagger: 0.1,
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
  const updateNavState = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 100);
  };
  window.addEventListener('scroll', updateNavState, { passive: true });
  updateNavState();

  // Menu toggle
  if (menuBtn && menuOverlay) {
    menuBtn.setAttribute('aria-expanded', 'false');

    menuBtn.addEventListener('click', () => {
      if (menuOverlay.classList.contains('is-open')) {
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

    // Close with Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOverlay.classList.contains('is-open')) {
        closeMenu();
        menuBtn.focus();
      }
    });

    function openMenu() {
      nav.classList.add('menu-open');
      menuOverlay.classList.add('is-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Cerrar menú');
      if (lenis) lenis.stop();
      if (!animate) return;

      // Animate links
      gsap.fromTo(menuLinks,
        { ...WIPE_FROM, y: 0 },
        { ...WIPE_TO, y: 0, duration: 0.7, stagger: 0.06, delay: 0.2 }
      );

      // Animate info
      if (menuInfo) {
        gsap.fromTo(menuInfo,
          { ...WIPE_FROM, y: 0 },
          { ...WIPE_TO, y: 0, duration: 0.7, delay: 0.5 }
        );
      }
    }

    function closeMenu() {
      nav.classList.remove('menu-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Abrir menú');

      if (!animate) {
        menuOverlay.classList.remove('is-open');
        return;
      }

      gsap.to(menuLinks, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        stagger: 0.03,
        ease: 'power2.in',
        onComplete: () => {
          menuOverlay.classList.remove('is-open');
          if (lenis) lenis.start();
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

    if (counter) counter.setAttribute('aria-live', 'polite');

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

    function goPrev() {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : totalSlides - 1;
      updateCarousel();
    }

    function goNext() {
      currentIndex = currentIndex < totalSlides - 1 ? currentIndex + 1 : 0;
      updateCarousel();
    }

    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    // Arrow keys while focus is inside the carousel
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    });

    // Slide width changes with the viewport (resize, rotation)
    window.addEventListener('resize', updateCarousel);

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
          goNext();
        } else {
          goPrev();
        }
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

    header.setAttribute('aria-expanded', 'false');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all others
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          const otherBody = other.querySelector('.accordion__body');
          if (otherBody) otherBody.style.maxHeight = '0';
          const otherHeader = other.querySelector('.accordion__header');
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        body.style.maxHeight = '0';
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        body.style.maxHeight = body.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// --- Contact Form ---
// Sends the form as a pre-written WhatsApp message to the company number
function initContactForm() {
  const form = document.querySelector('.form');
  if (!form) return;

  const number = form.dataset.whatsapp;
  const field = (name) => {
    const el = form.elements[name];
    if (!el) return '';
    if (el.tagName === 'SELECT') return el.value ? el.options[el.selectedIndex].text : '';
    return el.value.trim();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!number) return;

    const lines = [
      'Hola VR Construcciones, les escribo desde la web.',
      '',
      `Nombre: ${field('name')}`,
      `Email: ${field('email')}`,
      field('company') ? `Empresa: ${field('company')}` : null,
      `Tipo de proyecto: ${field('project-type')}`,
      '',
      field('message'),
    ].filter((line) => line !== null);

    const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  });
}

// --- Back to Top ---
function initBackToTop() {
  const backTopBtn = document.querySelector('.footer__back-top');
  if (!backTopBtn) return;

  backTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToTop();
  });
}

// --- Gallery "Ver más fotos" ---
function initGalleryMore() {
  const btn = document.querySelector('.gallery__more-btn');
  const gallery = document.querySelector('.gallery');
  if (!btn || !gallery) return;

  btn.addEventListener('click', () => {
    gallery.classList.add('is-expanded');
    btn.setAttribute('aria-expanded', 'true');
    btn.parentElement.hidden = true;
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    // The newly shown photos still need their reveal
    gallery.querySelectorAll('.gallery__item--extra').forEach((el) => el.classList.add('is-visible'));
  });
}

// --- Project Gallery Lightbox ---
function initLightbox() {
  const dialog = document.querySelector('.lightbox');
  const items = document.querySelectorAll('.gallery__item');
  if (!dialog || !items.length || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector('.lightbox__img');
  const counter = dialog.querySelector('.lightbox__counter');
  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    const thumb = items[current].querySelector('img');
    img.src = items[current].getAttribute('href');
    img.alt = thumb ? thumb.alt : '';
    counter.textContent = `${current + 1} / ${items.length}`;
  }

  items.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      show(index);
      dialog.showModal();
      if (lenis) lenis.stop();
    });
  });

  dialog.querySelector('.lightbox__btn--close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox__btn--prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.lightbox__btn--next').addEventListener('click', () => show(current + 1));

  // Click on the dark area (outside the photo and buttons) closes it
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Swipe on touch screens
  let startX = 0;
  dialog.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) show(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  dialog.addEventListener('close', () => {
    if (lenis) lenis.start();
    items[current].focus();
  });
}

// --- Works Slider (projects page) ---
function initWorksSlider() {
  const section = document.querySelector('.works');
  if (!section || typeof Swiper === 'undefined') return;

  const speed = prefersReducedMotion ? 300 : 1250;

  const bg = new Swiper(section.querySelector('.works__bg'), {
    speed,
    allowTouchMove: false,
  });

  const main = new Swiper(section.querySelector('.works__main'), {
    speed,
    rewind: true,
    grabCursor: true,
    keyboard: { enabled: true },
    // Two-finger horizontal swipe on trackpads changes project; vertical
    // scrolling is left alone so the page keeps scrolling normally
    mousewheel: {
      forceToAxis: true,
      thresholdDelta: 12,
      thresholdTime: 600,
    },
    effect: prefersReducedMotion ? 'fade' : 'creative',
    fadeEffect: { crossFade: true },
    creativeEffect: {
      prev: { shadow: true, translate: [0, 0, -500], opacity: 0 },
      next: { translate: ['100%', 0, 0], opacity: 1 },
    },
    navigation: {
      prevEl: section.querySelector('.works__btn--prev'),
      nextEl: section.querySelector('.works__btn--next'),
    },
    pagination: {
      el: section.querySelector('.works__bullets'),
      bulletClass: 'works__bullet',
      bulletActiveClass: 'is-active',
      bulletElement: 'button',
      clickable: true,
    },
    a11y: {
      prevSlideMessage: 'Proyecto anterior',
      nextSlideMessage: 'Proyecto siguiente',
      paginationBulletMessage: 'Ir al proyecto {{index}}',
    },
  });

  main.controller.control = bg;

  const current = section.querySelector('.works__counter-current');
  main.on('slideChange', () => {
    if (current) current.textContent = main.realIndex + 1;
  });

  section.classList.add('is-ready');
}

// --- Hero Video ---
// Background videos only play when the user hasn't asked for reduced motion.
// A video with data-media (e.g. portrait only) plays just while that matches,
// and since it uses preload="none" it isn't downloaded otherwise.
function initHeroVideo() {
  document.querySelectorAll('.page-hero__bg-video').forEach((video) => {
    const query = video.dataset.media ? window.matchMedia(video.dataset.media) : null;

    const update = () => {
      if (prefersReducedMotion || (query && !query.matches)) {
        video.pause();
        return;
      }
      // Some browsers block autoplay until the video is explicitly muted from script
      video.muted = true;
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => {});
    };

    if (prefersReducedMotion) video.removeAttribute('autoplay');
    update();
    if (query) query.addEventListener('change', update);
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
    tl.fromTo(label, WIPE_FROM, { ...WIPE_TO, duration: 0.8 }, 0);
  }

  if (title) {
    const lines = title.querySelectorAll('.line-inner');
    if (lines.length) {
      tl.fromTo(lines, WIPE_FROM, { ...WIPE_TO, duration: 1.1, stagger: 0.12 }, 0.2);
    } else {
      tl.fromTo(title, WIPE_FROM, { ...WIPE_TO, duration: 1 }, 0.2);
    }
  }
}

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
  if (animate) {
    initLoader();
    initPageHero();
  }
  initNavigation();
  initCarousel();
  initAccordion();
  initContactForm();
  initBackToTop();
  initLightbox();
  initGalleryMore();
  initHeroVideo();
  initWorksSlider();
});
