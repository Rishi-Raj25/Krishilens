
var tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.8 } });

tl.from("#navbar h2, #navbar h3", {
    y: -20,
    opacity: 0,
    stagger: 0.1
})
.from("#navbar img", {
    scale: 0.8,
    opacity: 0,
    duration: 1
}, "-=0.6")
.from("#bigBuffalo img", {
    y: 30,
    opacity: 0,
    scale: 0.9,
    duration: 1.2
}, "-=0.8")
.from("#upload h1, #upload h2, #upload button", {
    y: 20,
    opacity: 0,
    stagger: 0.2
}, "-=0.8");

// Scroll Reveal Logic
const revealSections = () => {
    const sections = document.querySelectorAll("#about, #how, #breeds, #cards");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                gsap.to(entry.target, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power2.out"
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(section => {
        gsap.set(section, { opacity: 0, y: 30 }); // Initial state
        observer.observe(section);
    });
};

document.addEventListener("DOMContentLoaded", revealSections);







