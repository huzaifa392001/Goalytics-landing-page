/**
 * GOALYTICS LANDING PAGE — script.js
 *
 * Each animation lives in its own function below. They're called in the
 * same top-to-bottom order the sections appear on the page (see the
 * "Run everything" block at the bottom), and every animation call is
 * followed by ScrollTrigger.refresh() so trigger positions stay accurate
 * as later sections add to the page's layout/height.
 *
 * Sections handled:
 *  1. GSAP + ScrollTrigger + Lenis setup (prefers-reduced-motion aware)
 *  2. Navbar: scroll effect + mobile hamburger
 *  3. Hero: staggered entrance animation
 *  4. Hero: stat counters
 *  5. Generic scroll reveals (.reveal elements, all sections)
 *  6. Our Story: stacked bar chart animation
 *  7. Problem & Solution: pinned GSAP scroll-story (desktop), static fallback (mobile/reduced motion)
 *  8. Features: staggered card reveal
 *  9. Features: weightage bars
 * 10. Features/AI: card hover spring bounce
 * 11. How It Works: progressive steps reveal
 * 12. Collaborative: parallax tilt
 * 13. AI: staggered card reveal
 * 14. Testimonials: slider (autoplay, arrows, dots, swipe, keyboard)
 * 15. Contact form: validation + submit handler
 * 16. Footer: year
 * 17. Smooth scroll for anchor links
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;

/* ─── 1. GSAP + ScrollTrigger + Lenis Setup ──────────────────────────── */

function initGsapAndScrollTrigger() {
    gsap.registerPlugin(ScrollTrigger);
}

function initLenis() {
    // Lenis: smooth scroll, driven by the GSAP ticker so it stays in lockstep
    // with ScrollTrigger (required for the pinned Problem & Solution section).
    // Skipped entirely under prefers-reduced-motion — native scroll takes over.
    if (prefersReducedMotion || typeof Lenis === 'undefined') return;

    lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        autoRaf: false
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}

/* ─── 2. Navbar ─────────────────────────────────────────────────────── */

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    // Scroll effect: add .scrolled class after 60px
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile hamburger toggle
    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

/* ─── 3. Hero: Entrance Animation ────────────────────────────────────── */

function animateHero() {
    if (!prefersReducedMotion) {
        // Hero elements start hidden via CSS; animate them in to their resting state
        const heroTl = gsap.timeline({ delay: 0.15 });

        heroTl
            .to('#hero-badge', {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: 'back.out(2)'
            })
            .to('#hero-headline', {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power3.out'
            }, '-=0.3')
            .to('#hero-sub', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.4')
            .to('#hero-actions .btn', {
                opacity: 1,
                y: 0,
                stagger: 0.12,
                duration: 0.5,
                ease: 'back.out(1.5)'
            }, '-=0.3')
            .to('#hero-stats .stat, #hero-stats .stat-divider', {
                opacity: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.4,
                ease: 'power2.out'
            }, '-=0.2')
            .to('#hero-mockup', {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.9,
                ease: 'power3.out'
            }, '-=0.9')
            .to('#hero-mockup .float-card', {
                opacity: 1,
                scale: 1,
                stagger: 0.15,
                duration: 0.5,
                ease: 'back.out(2)'
            }, '-=0.4');
    }
    // Reduced motion: no tween — the CSS reduced-motion media query forces
    // these elements straight to their resting (visible) state instead.
}

/* ─── 4. Hero: Stat Counters ──────────────────────────────────────────── */

function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1.8;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out curve
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        // Format with commas for large numbers
        el.textContent = current >= 1000
            ? current.toLocaleString()
            : String(current);

        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target >= 1000 ? target.toLocaleString() : String(target);
    }

    requestAnimationFrame(tick);
}

function initHeroCounters() {
    const statsSection = document.getElementById('hero-stats');
    if (!statsSection) return;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.stat-num').forEach(animateCounter);
                counterObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });
    counterObserver.observe(statsSection);
}

/* ─── 5. Generic Scroll Reveals (.reveal elements, all sections) ─────── */

function animateScrollReveals() {
    document.querySelectorAll('.reveal').forEach((el) => {
        // Add stagger delay based on sibling position within the same parent
        const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
        const siblingIndex = siblings.indexOf(el);

        if (!prefersReducedMotion) {
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.65,
                ease: 'power3.out',
                delay: siblingIndex * 0.1,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                    once: true
                }
            });
        } else {
            // No motion: just reveal immediately
            el.classList.add('is-visible');
        }
    });
}

/* ─── 6. Our Story: Stacked Bar Chart Animation ──────────────────────── */

function animateStoryChart() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.chart-bar-stack').forEach(stack => {
        const segments = Array.from(stack.querySelectorAll('.bar-segment'));

        segments.forEach(seg => {
            seg.dataset.targetHeight = seg.style.height;
            seg.style.height = '0px';
            const valueEl = seg.querySelector('.seg-value');
            if (valueEl) valueEl.textContent = '0';
        });

        ScrollTrigger.create({
            trigger: stack,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                segments.forEach((seg, i) => {
                    gsap.to(seg, {
                        height: seg.dataset.targetHeight,
                        duration: 0.9,
                        delay: i * 0.15,
                        ease: 'power3.out'
                    });

                    const valueEl = seg.querySelector('.seg-value');
                    if (!valueEl) return;
                    const target = parseFloat(valueEl.dataset.target);
                    const counter = { val: 0 };
                    gsap.to(counter, {
                        val: target,
                        duration: 0.9,
                        delay: i * 0.15,
                        ease: 'power3.out',
                        onUpdate: () => { valueEl.textContent = Math.round(counter.val); },
                        onComplete: () => { valueEl.textContent = target; }
                    });
                });
            }
        });
    });
}

/* ─── 7. Problem & Solution: Scroll Story ─────────────────────────────── */

function initProblemSolutionStory() {
    const section = document.querySelector('.problem-solution');
    if (!section) return;

    const stage = document.getElementById('ps-stage');
    const panels = Array.from(stage.querySelectorAll('.ps-panel'));
    const ringWrap = document.getElementById('ps-ring-wrap');
    const ringFg = document.getElementById('ps-ring-fg');
    const ringNum = document.getElementById('ps-ring-num');
    const visualIcon = document.getElementById('ps-visual-icon');
    const progressFill = document.getElementById('ps-progress-fill');
    const progressPhases = document.querySelectorAll('.ps-progress-phase');
    const pin = document.querySelector('.ps-pin');

    const RING_CIRCUMFERENCE = 2 * Math.PI * 52;
    ringFg.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    ringFg.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;

    const enablePin = !prefersReducedMotion && window.matchMedia('(min-width: 901px)').matches;

    function setupOutcomeCounters() {
        const outcomeNums = document.querySelectorAll('.ps-outcome-num');
        const outcomePanel = document.querySelector('.ps-panel-outcome');
        if (!outcomeNums.length || !outcomePanel) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    outcomeNums.forEach(animateCounter);
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(outcomePanel);
    }

    if (!enablePin) {
        // Mobile / reduced motion: keep the simple static stacked layout,
        // just count up the outcome stats when they scroll into view.
        setupOutcomeCounters();
        return;
    }

    section.classList.add('is-pinned-mode');

    let activeIndex = -1;
    let ringTween = null;
    let numTween = null;
    let outcomeCountersPlayed = false;

    function setActivePanel(index) {
        if (index === activeIndex) return;
        activeIndex = index;

        panels.forEach((p, i) => p.classList.toggle('is-active', i === index));

        const panel = panels[index];
        const phase = panel.dataset.phase;
        const hasStat = panel.dataset.stat !== undefined;

        section.dataset.activePhase = phase;

        gsap.to(progressFill, {
            width: `${(index / (panels.length - 1)) * 100}%`,
            duration: 0.5,
            ease: 'power2.out'
        });

        const inSolutionHalf = phase === 'solution' || phase === 'outcome';
        progressPhases.forEach(el => {
            const isProblemLabel = el.dataset.phase === 'problem';
            el.classList.toggle('is-active', isProblemLabel ? !inSolutionHalf : inSolutionHalf);
        });

        if (hasStat) {
            ringWrap.classList.remove('phase-hidden', 'phase-problem', 'phase-solution');
            ringWrap.classList.add(`phase-${phase}`);
            visualIcon.classList.remove('is-active');

            const target = parseFloat(panel.dataset.stat);
            const targetOffset = RING_CIRCUMFERENCE * (1 - Math.min(target, 100) / 100);

            if (ringTween) ringTween.kill();
            ringTween = gsap.to(ringFg, {
                strokeDashoffset: targetOffset,
                duration: 0.7,
                ease: 'power3.out'
            });

            if (numTween) numTween.kill();
            const counter = { val: parseFloat(ringNum.textContent) || 0 };
            numTween = gsap.to(counter, {
                val: target,
                duration: 0.7,
                ease: 'power3.out',
                onUpdate: () => { ringNum.textContent = Math.round(counter.val); }
            });
        } else {
            ringWrap.classList.add('phase-hidden');
            visualIcon.classList.add('is-active');
            visualIcon.dataset.state = phase;
        }

        if (phase === 'outcome' && !outcomeCountersPlayed) {
            outcomeCountersPlayed = true;
            panel.querySelectorAll('.ps-outcome-num').forEach(animateCounter);
        }
    }

    ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: () => `+=${panels.length * Math.round(window.innerHeight * 0.5)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
            const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
            setActivePanel(idx);
        }
    });

    setActivePanel(0);
}

/* ─── 8. Features: Staggered Card Reveal ─────────────────────────────── */

function animateFeatureCards() {
    // Initial hidden state (opacity/transform) lives in CSS on .feature-card;
    // the reduced-motion media query forces it back to visible with no tween.
    if (prefersReducedMotion) return;

    gsap.to('.feature-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.08,
        duration: 0.6,
        ease: 'back.out(1.4)',
        scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 80%',
            once: true
        }
    });
}

/* ─── 9. Features: Weightage Bars ─────────────────────────────────────── */

function animateWeightageBars() {
    if (prefersReducedMotion) return;

    const bars = document.querySelectorAll('.wr-bar');
    bars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';

        ScrollTrigger.create({
            trigger: bar,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(bar, {
                    width: targetWidth,
                    duration: 1,
                    ease: 'power3.out'
                });
            }
        });
    });
}

/* ─── 10. Features/AI: Card Hover Spring Bounce ──────────────────────── */

function initFeatureCardHover() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { scale: 1.03, y: -6, duration: 0.35, ease: 'back.out(2)' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { scale: 1, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
        });
    });
}

function initAICardHover() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.ai-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        });
    });
}

/* ─── 11. How It Works: Progressive Steps Reveal ─────────────────────── */

function animateSteps() {
    // Initial hidden state (opacity/transform) lives in CSS on .steps-line,
    // .step and .step-number; the reduced-motion media query forces them
    // back to visible with no tween.
    if (prefersReducedMotion) return;

    gsap.to('.steps-line', {
        scaleY: 1,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.steps-container',
            start: 'top 75%',
            once: true
        }
    });

    gsap.to('.step', {
        opacity: 1,
        x: 0,
        stagger: 0.18,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.steps-container',
            start: 'top 78%',
            once: true
        }
    });

    // Step numbers bounce in
    gsap.to('.step-number', {
        scale: 1,
        stagger: 0.18,
        duration: 0.5,
        ease: 'back.out(2.5)',
        delay: 0.3,
        scrollTrigger: {
            trigger: '.steps-container',
            start: 'top 78%',
            once: true
        }
    });
}

/* ─── 12. Collaborative: Parallax Tilt ────────────────────────────────── */

function animateCollabParallax() {
    if (prefersReducedMotion || window.innerWidth <= 768) return;

    gsap.to('.collab-visual', {
        y: -30,
        ease: 'none',
        scrollTrigger: {
            trigger: '#collaborative',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
        }
    });
}

/* ─── 13. AI: Staggered Card Reveal ──────────────────────────────────── */

function animateAICards() {
    // Initial hidden state (opacity/transform) lives in CSS on .ai-card;
    // the reduced-motion media query forces it back to visible with no tween.
    if (prefersReducedMotion) return;

    gsap.to('.ai-card', {
        opacity: 1,
        y: 0,
        stagger: 0.07,
        duration: 0.55,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.ai-grid',
            start: 'top 82%',
            once: true,
        }
    });
}

/* ─── 14. Testimonials Slider ─────────────────────────────────────────── */

function initTestimonialSlider() {
    const testimonialSlider = document.getElementById('testimonial-slider');
    if (!testimonialSlider) return;

    const track = document.getElementById('testimonial-track');
    const slides = Array.from(track.children);
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsWrap = document.getElementById('slider-dots');
    const AUTOPLAY_MS = 6000;

    let current = 0;
    let autoplayTimer = null;

    // Build one dot per slide
    slides.forEach((slide, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1} of ${slides.length}`);
        dot.addEventListener('click', () => goTo(i, true));
        dotsWrap.appendChild(dot);

        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    });
    const dots = Array.from(dotsWrap.children);

    function render() {
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === current);
            dot.setAttribute('aria-selected', String(i === current));
        });
        slides.forEach((slide, i) => {
            slide.setAttribute('aria-hidden', String(i !== current));
        });
    }

    function goTo(index, userInitiated) {
        current = (index + slides.length) % slides.length;
        render();
        if (userInitiated) restartAutoplay();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
        if (prefersReducedMotion || slides.length < 2) return;
        stopAutoplay();
        autoplayTimer = setInterval(next, AUTOPLAY_MS);
    }

    function stopAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
        autoplayTimer = null;
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
    nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });

    // Pause on hover / focus, resume on leave / blur
    testimonialSlider.addEventListener('mouseenter', stopAutoplay);
    testimonialSlider.addEventListener('mouseleave', startAutoplay);
    testimonialSlider.addEventListener('focusin', stopAutoplay);
    testimonialSlider.addEventListener('focusout', startAutoplay);

    // Keyboard navigation
    testimonialSlider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { prev(); restartAutoplay(); }
        else if (e.key === 'ArrowRight') { next(); restartAutoplay(); }
    });

    // Touch / mouse swipe
    let dragStartX = null;
    let dragDeltaX = 0;

    function onDragStart(x) {
        dragStartX = x;
        dragDeltaX = 0;
        stopAutoplay();
        track.style.transition = 'none';
    }

    function onDragMove(x) {
        if (dragStartX === null) return;
        dragDeltaX = x - dragStartX;
        const percent = (dragDeltaX / testimonialSlider.offsetWidth) * 100;
        track.style.transform = `translateX(calc(-${current * 100}% + ${percent}%))`;
    }

    function onDragEnd() {
        if (dragStartX === null) return;
        track.style.transition = '';

        const threshold = testimonialSlider.offsetWidth * 0.15;
        if (dragDeltaX > threshold) prev();
        else if (dragDeltaX < -threshold) next();
        else render();

        dragStartX = null;
        dragDeltaX = 0;
        startAutoplay();
    }

    track.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchend', onDragEnd);

    track.addEventListener('mousedown', (e) => { e.preventDefault(); onDragStart(e.clientX); });
    window.addEventListener('mousemove', (e) => onDragMove(e.clientX));
    window.addEventListener('mouseup', onDragEnd);

    render();
    startAutoplay();
}

/* ─── 15. Contact Form: Validation + Submit Handler ──────────────────── */

function validateField(name, value) {
    const trimmed = value.trim();

    switch (name) {
        case 'name':
            if (!trimmed) return 'Full name is required.';
            if (trimmed.length < 2) return 'Name must be at least 2 characters.';
            return '';

        case 'email':
            if (!trimmed) return 'Email address is required.';
            // Basic RFC 5322-ish pattern
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
                return 'Please enter a valid email address.';
            }
            return '';

        case 'message':
            if (!trimmed) return 'Message is required.';
            if (trimmed.length < 10) return 'Message must be at least 10 characters.';
            return '';

        default:
            return '';
    }
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('submit-btn');
    const modalOverlay = document.getElementById('success-modal-overlay');
    const modal = modalOverlay ? modalOverlay.querySelector('.success-modal') : null;
    const modalCloseBtn = document.getElementById('success-modal-close');
    const modalOkBtn = document.getElementById('success-modal-ok');

    function openSuccessModal() {
        if (!modalOverlay) return;

        modalOverlay.hidden = false;
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();

        // Force a reflow so the overlay's opacity transition actually runs
        // instead of being skipped because it starts in the same tick as [hidden] is removed
        void modalOverlay.offsetHeight;
        modalOverlay.classList.add('is-visible');

        if (!prefersReducedMotion) {
            gsap.to(modal, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.45,
                ease: 'back.out(1.5)'
            });
        }

        modalCloseBtn.focus();
    }

    function closeSuccessModal() {
        if (!modalOverlay) return;

        modalOverlay.classList.remove('is-visible');
        document.body.style.overflow = '';
        if (lenis) lenis.start();

        const finish = () => { modalOverlay.hidden = true; };

        if (!prefersReducedMotion) {
            gsap.to(modal, {
                opacity: 0,
                scale: 0.92,
                y: 10,
                duration: 0.25,
                ease: 'power2.in',
                onComplete: finish
            });
        } else {
            finish();
        }
    }

    if (modalOverlay) {
        modalCloseBtn.addEventListener('click', closeSuccessModal);
        modalOkBtn.addEventListener('click', closeSuccessModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeSuccessModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modalOverlay.hidden) closeSuccessModal();
        });
    }

    function showError(name, message) {
        const input = form.querySelector(`[name="${name}"]`);
        const errorEl = document.getElementById(`error-${name}`);
        if (!input || !errorEl) return;

        input.classList.add('is-error');
        errorEl.textContent = message;
    }

    function clearError(name) {
        const input = form.querySelector(`[name="${name}"]`);
        const errorEl = document.getElementById(`error-${name}`);
        if (!input || !errorEl) return;

        input.classList.remove('is-error');
        errorEl.textContent = '';
    }

    // Inline validation on blur
    ['name', 'email', 'message'].forEach(fieldName => {
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (!input) return;

        input.addEventListener('blur', () => {
            const error = validateField(fieldName, input.value);
            if (error) showError(fieldName, error);
            else clearError(fieldName);
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('is-error')) {
                const error = validateField(fieldName, input.value);
                if (!error) clearError(fieldName);
            }
        });
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear all errors first
        ['name', 'email', 'message'].forEach(clearError);

        // Validate all required fields
        const fields = ['name', 'email', 'message'];
        let hasErrors = false;

        fields.forEach(fieldName => {
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (!input) return;
            const error = validateField(fieldName, input.value);
            if (error) {
                showError(fieldName, error);
                hasErrors = true;
            }
        });

        if (hasErrors) {
            // Shake the form gently to indicate errors
            if (!prefersReducedMotion) {
                gsap.fromTo(form,
                    { x: -8 },
                    { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
                );
            }
            // Focus first error field
            const firstErrorInput = form.querySelector('.is-error');
            if (firstErrorInput) firstErrorInput.focus();
            return;
        }

        // Show loading state
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');
        submitBtn.disabled = true;
        btnText.hidden = true;
        btnSpinner.hidden = false;

        // ─────────────────────────────────────────────────────────────────
        // TODO: Replace the simulated delay below with a real submit to the
        // PHP endpoint that will send mail via SMTP to info@goalytics.io,
        // cc: nida@goalytics.io, shahzer@goalytics.io.
        //
        //   const formData = new FormData(form);
        //   const payload = {
        //     name:    formData.get('name'),
        //     email:   formData.get('email'),
        //     company: formData.get('company'),
        //     message: formData.get('message'),
        //   };
        //
        //   const response = await fetch('/contact.php', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(payload),
        //   });
        //
        //   if (!response.ok) throw new Error('Submission failed');
        //   const data = await response.json();
        //   console.log('Success:', data);
        // ─────────────────────────────────────────────────────────────────

        try {
            // Simulated network delay — REMOVE when wiring real endpoint
            await new Promise(resolve => setTimeout(resolve, 1400));

            // Keep the form in place; just clear it and show the success modal
            form.reset();
            openSuccessModal();

        } catch (error) {
            console.error('Contact form submission error:', error);
            showError('message', 'Something went wrong. Please try again or email us directly.');
        } finally {
            submitBtn.disabled = false;
            btnText.hidden = false;
            btnSpinner.hidden = true;
        }
    });
}

/* ─── 16. Footer Year ─────────────────────────────────────────────────── */

function initFooterYear() {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ─── 17. Smooth Scroll for Anchor Links ─────────────────────────────── */

function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const offset = 80; // navbar height

            if (lenis) {
                lenis.scrollTo(target, { offset: -offset });
                return;
            }

            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
        });
    });
}

/* ─── Run everything, in page-section order ──────────────────────────── */

// Setup — must run first, nothing to refresh yet
initGsapAndScrollTrigger();
initLenis();

// Navbar — not an animation, no refresh needed
initNavbar();

// Hero
animateHero();
initHeroCounters();

// Our Story
animateStoryChart();

// Problem & Solution — must run before animateScrollReveals() below: it
// pins a section and adds a large chunk of scroll height, which shifts
// the position of every element that comes after it in the DOM. Registering
// .reveal triggers first would measure them against the shorter pre-pin
// layout and misfire them all at once near the pin's old position.
initProblemSolutionStory();
ScrollTrigger.refresh();  // refresh after P&S because it pins and changes layout height

// Cross-section reveals (Our Story, Team, Testimonials, Contact, etc.) —
// registered after the pin above so every element's position is measured
// against the final, correct layout.
animateScrollReveals();

// Features
animateFeatureCards();
animateWeightageBars();
initFeatureCardHover();

// How It Works
animateSteps();

// Collaborative
animateCollabParallax();

// AI
animateAICards();
initAICardHover();

// Testimonials
initTestimonialSlider();

// Contact
initContactForm();

// Footer — not an animation, no refresh needed
initFooterYear();

// Global anchor-link wiring — not an animation, no refresh needed
initAnchorScroll();
