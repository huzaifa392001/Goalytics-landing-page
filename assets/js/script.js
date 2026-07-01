/**
 * GOALYTICS LANDING PAGE — script.js
 *
 * Sections handled:
 *  1. GSAP + ScrollTrigger setup (prefers-reduced-motion aware)
 *  2. Navbar: scroll effect + mobile hamburger
 *  3. Hero: staggered entrance animation
 *  4. Section reveals (ScrollTrigger)
 *  5. Counter animation (hero stats)
 *  6. Feature cards: staggered scroll reveal
 *  7. Steps: progressive reveal
 *  8. AI cards: staggered reveal
 *  9. Mockup: pulsing + floating cards
 * 10. Contact form: JS validation + submit handler
 * 11. Footer: year
 */

/* ─── 1. Setup ──────────────────────────────────────────────────────── */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/* ─── 2. Navbar ─────────────────────────────────────────────────────── */

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

/* ─── 3. Hero: Entrance Animation ──────────────────────────────────── */

if (!prefersReducedMotion) {
    // Hero text elements animate in on page load
    const heroTl = gsap.timeline({ delay: 0.15 });

    heroTl
        .from('#hero-badge', {
            opacity: 0,
            y: 20,
            scale: 0.9,
            duration: 0.6,
            ease: 'back.out(2)'
        })
        .from('#hero-headline', {
            opacity: 0,
            y: 40,
            duration: 0.7,
            ease: 'power3.out'
        }, '-=0.3')
        .from('#hero-sub', {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.4')
        .from('#hero-actions .btn', {
            opacity: 0,
            y: 20,
            stagger: 0.12,
            duration: 0.5,
            ease: 'back.out(1.5)'
        }, '-=0.3')
        .from('#hero-stats .stat, #hero-stats .stat-divider', {
            opacity: 0,
            y: 15,
            stagger: 0.08,
            duration: 0.4,
            ease: 'power2.out'
        }, '-=0.2')
        .from('#hero-mockup', {
            opacity: 0,
            x: 60,
            scale: 0.92,
            duration: 0.9,
            ease: 'power3.out'
        }, '-=0.9')
        .from('.float-card', {
            opacity: 0,
            scale: 0.7,
            stagger: 0.15,
            duration: 0.5,
            ease: 'back.out(2)'
        }, '-=0.4');

    // Goal cards animate in with stagger inside mockup
    gsap.from('.m-goal-card', {
        opacity: 0,
        x: 20,
        stagger: 0.15,
        duration: 0.5,
        ease: 'power2.out',
        delay: 1.2
    });
}

/* ─── 4. Scroll Reveals ─────────────────────────────────────────────── */

// Generic .reveal elements
document.querySelectorAll('.reveal').forEach((el, i) => {
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

/* ─── 5. Counter Animation (Hero Stats) ─────────────────────────────── */

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

// Trigger counters when hero stats become visible
const statsSection = document.getElementById('hero-stats');
if (statsSection) {
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

/* ─── 6. Feature Cards: Staggered Bounce Reveal ─────────────────────── */

if (!prefersReducedMotion) {
    gsap.from('.feature-card', {
        opacity: 0,
        y: 50,
        scale: 0.95,
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

/* ─── 7. Steps: Progressive Line + Card Reveal ──────────────────────── */

if (!prefersReducedMotion) {
    gsap.from('.steps-line', {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.steps-container',
            start: 'top 75%',
            once: true
        }
    });

    gsap.from('.step', {
        opacity: 0,
        x: -30,
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
    gsap.from('.step-number', {
        scale: 0,
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

/* ─── 8. AI Cards: Staggered Reveal ─────────────────────────────────── */

if (!prefersReducedMotion) {
    gsap.from('.ai-card', {
        opacity: 0,
        y: 40,
        stagger: 0.07,
        duration: 0.55,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.ai-grid',
            start: 'top 82%',
            once: true
        }
    });
}

/* ─── 9. Weightage Bars Animate on Scroll ───────────────────────────── */

if (!prefersReducedMotion) {
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

/* ─── 10. Collaborative & About Sections: Parallax Tilt ─────────────── */

if (!prefersReducedMotion && window.innerWidth > 768) {
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

/* ─── 11. Contact Form: Validation + Submit Handler ─────────────────── */

const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formSuccess = document.getElementById('form-success');

/**
 * Validates a single field. Returns error message string or empty string.
 * @param {string} name - field name
 * @param {string} value - field value
 */
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

/** Shows an error for a field */
function showError(name, message) {
    const input = form.querySelector(`[name="${name}"]`);
    const errorEl = document.getElementById(`error-${name}`);
    if (!input || !errorEl) return;

    input.classList.add('is-error');
    errorEl.textContent = message;
}

/** Clears error for a field */
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
    // TODO: Replace the simulated delay below with a real API call.
    //
    // Example using fetch:
    //
    //   const formData = new FormData(form);
    //   const payload = {
    //     name:    formData.get('name'),
    //     email:   formData.get('email'),
    //     company: formData.get('company'),
    //     message: formData.get('message'),
    //   };
    //
    //   const response = await fetch('YOUR_ENDPOINT_URL_HERE', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload),
    //   });
    //
    //   if (!response.ok) throw new Error('Submission failed');
    //   const data = await response.json();
    //   console.log('Success:', data);
    //
    // Or using the existing app's ContactSupportService endpoint:
    //   POST /api/v1/support  (multipart/form-data)
    // ─────────────────────────────────────────────────────────────────

    try {
        // Simulated network delay — REMOVE when wiring real endpoint
        await new Promise(resolve => setTimeout(resolve, 1400));

        // Show success state
        form.style.display = 'none';
        formSuccess.hidden = false;

        if (!prefersReducedMotion) {
            gsap.from(formSuccess, {
                opacity: 0,
                y: 20,
                scale: 0.95,
                duration: 0.5,
                ease: 'back.out(1.5)'
            });
        }

    } catch (error) {
        // On failure, restore button and show generic error
        console.error('Contact form submission error:', error);
        showError('message', 'Something went wrong. Please try again or email us directly.');
        submitBtn.disabled = false;
        btnText.hidden = false;
        btnSpinner.hidden = true;
    }
});

/* ─── 12. Footer Year ────────────────────────────────────────────────── */

const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── 13. Smooth Scroll for all anchor links ─────────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        // Native smooth scroll (no ScrollToPlugin dependency)
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
    });
});

/* ─── 14. Feature card hover: spring bounce ─────────────────────────── */

if (!prefersReducedMotion) {
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { scale: 1.03, y: -6, duration: 0.35, ease: 'back.out(2)' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { scale: 1, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
        });
    });

    document.querySelectorAll('.ai-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        });
    });
}
