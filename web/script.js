// ============================================================
// KrishiLens — Animation System (Visibility-Safe)
// ============================================================

// ---------------------
// 1. Page Load: GSAP Timeline (navbar + hero only)
// ---------------------
var tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.7 } });

tl.from("#navbar", { y: -50, opacity: 0, duration: 0.5 })
  .from("#navbar h2", { y: -12, opacity: 0, duration: 0.4 }, "-=0.3")
  .from("#navbar h3", { y: -10, opacity: 0, stagger: 0.08, duration: 0.35 }, "-=0.2")
  .from("#bigBuffalo img", { y: 25, opacity: 0, scale: 0.95, duration: 0.8 }, "-=0.4")
  .from("#upload h1", { y: 12, opacity: 0, duration: 0.5 }, "-=0.5")
  .from("#upload h2", { y: 10, opacity: 0, duration: 0.4 }, "-=0.3")
  .from("#upload button", { y: 8, opacity: 0, scale: 0.95, duration: 0.35 }, "-=0.2");

// ---------------------
// 2. Button Press Micro-Interactions
// ---------------------
document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("mousedown", () => {
        gsap.to(btn, { scale: 0.96, duration: 0.1, ease: "power2.out" });
    });
    btn.addEventListener("mouseup", () => {
        gsap.to(btn, { scale: 1, duration: 0.15, ease: "back.out(2)" });
    });
    btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { scale: 1, duration: 0.15 });
    });
});

// ---------------------
// 3. Scroll Reveal — SAFE version with visibility fallback
// ---------------------
document.addEventListener("DOMContentLoaded", () => {

    // Only animate elements that are NOT already in view
    const revealTargets = [
        { selector: "#about",    stagger: false, delay: 0 },
        { selector: "#how",      stagger: false, delay: 0 },
        { selector: ".step",     stagger: true,  delay: 0.07 },
        { selector: "#breeds",   stagger: false, delay: 0 },
        { selector: "#cards",    stagger: false, delay: 0 },
        { selector: "#card",     stagger: true,  delay: 0.05 },
        { selector: "#box2, #box3, #box4", stagger: true, delay: 0.08 },
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseFloat(el.dataset.revealDelay || 0);

                // Only animate if currently hidden by us
                if (el.dataset.revealPending === "true") {
                    gsap.fromTo(el,
                        { opacity: 0, y: 15 },
                        { opacity: 1, y: 0, duration: 0.6, delay, ease: "power2.out",
                          onComplete: () => { el.style.opacity = ""; el.style.transform = ""; }
                        }
                    );
                    el.dataset.revealPending = "false";
                }
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    revealTargets.forEach(({ selector, stagger, delay }) => {
        const els = document.querySelectorAll(selector);
        els.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;

            if (!inView) {
                // Only hide if it's off-screen
                el.dataset.revealPending = "true";
                el.dataset.revealDelay = stagger ? delay * i : delay;
                gsap.set(el, { opacity: 0, y: 15 });
                observer.observe(el);
            }
            // If already in view, leave it fully visible — no hiding
        });
    });

    // Safety fallback: after 2s, ensure nothing is stuck hidden
    setTimeout(() => {
        document.querySelectorAll("[data-reveal-pending='true']").forEach(el => {
            el.dataset.revealPending = "false";
            gsap.to(el, { opacity: 1, y: 0, duration: 0.4 });
        });
    }, 2000);
});
