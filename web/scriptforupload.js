// ============================================================
// KrishiLens Upload Page — Premium Animation System
// ============================================================

// ---------------------
// 1. Page Load: GSAP Timeline
// ---------------------
var tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.6 } });

tl.from("#navbar", { y: -50, opacity: 0, duration: 0.5 })
  .from("#navbar h2", { y: -12, opacity: 0 }, "-=0.3")
  .from("#innerSection", { y: 25, opacity: 0, duration: 0.7 }, "-=0.2")
  .from(".left-col, .right-col", { y: 15, opacity: 0, stagger: 0.15 }, "-=0.4");

// ---------------------
// 2. DOM Elements
// ---------------------
const fileInput       = document.getElementById("fileInput");
const gallery         = document.getElementById("gallery");
const addPhoto        = document.getElementById("addPhoto");
const analyzeBtn      = document.getElementById("analyzeBtn");
const breedName       = document.getElementById("breedName");
const breedDescription = document.getElementById("breedDescription");
const confidenceScore = document.getElementById("confidenceScore");

// ---------------------
// 3. Button Press Micro-Interactions
// ---------------------
[analyzeBtn].forEach(btn => {
    if (!btn) return;
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
// 4. Upload Box Glow on Hover
// ---------------------
addPhoto.addEventListener("mouseenter", () => {
    gsap.to(addPhoto, {
        boxShadow: "0 8px 30px rgba(0, 128, 0, 0.18)",
        duration: 0.3,
        ease: "power2.out"
    });
});
addPhoto.addEventListener("mouseleave", () => {
    gsap.to(addPhoto, {
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out"
    });
});

// ---------------------
// 5. File Input — Click Gallery to Upload
// ---------------------
gallery.addEventListener("click", (e) => {
    e.preventDefault();
    fileInput.click();
});

// ---------------------
// 6. File Selected — Display Image + Reveal Analyze Button
// ---------------------
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            gallery.src = e.target.result;
            gallery.style.position = "static";
            gallery.style.width = "100%";
            gallery.style.height = "100%";
            gallery.style.objectFit = "cover";

            // Smooth image reveal
            gsap.from(gallery, { opacity: 0, scale: 0.97, duration: 0.5, ease: "power2.out" });

            analyzeBtn.style.display = "block";
            gsap.from(analyzeBtn, {
                y: 15,
                opacity: 0,
                duration: 0.45,
                ease: "power2.out"
            });
        };
        reader.readAsDataURL(file);
    }
});

// ---------------------
// 7. Analyze Breed — API Call + Smooth Result Reveal
// ---------------------
analyzeBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    analyzeBtn.textContent = "Analyzing...";
    analyzeBtn.classList.add("loading");
    analyzeBtn.disabled = true;

    // Fade out result sections while loading
    gsap.to("#similaritySection, #descriptionSection", {
        opacity: 0.4,
        duration: 0.3
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/api/predict-breed", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();

        breedName.textContent = data.breed || "Unknown Breed";
        confidenceScore.textContent = data.confidence ? `Confidence: ${data.confidence}%` : "";

        // Render bullet points
        breedDescription.innerHTML = "";
        if (data.description && Array.isArray(data.description)) {
            data.description.forEach(point => {
                const li = document.createElement("li");
                li.textContent = point;
                breedDescription.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent = data.description || "No description available.";
            breedDescription.appendChild(li);
        }

        // Smooth fade-in + slide-up for result cards
        gsap.fromTo(
            "#similaritySection, #descriptionSection",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: "power2.out" }
        );

        // Animate individual bullet points in
        gsap.from("#breedDescription li", {
            opacity: 0,
            x: -10,
            stagger: 0.07,
            duration: 0.4,
            ease: "power2.out",
            delay: 0.3
        });

    } catch (error) {
        console.error("Error:", error);
        breedName.textContent = "Analysis Failed";
        confidenceScore.textContent = "";
        breedDescription.innerHTML = "<li>Please ensure the server is running.</li>";

        gsap.fromTo(
            "#similaritySection, #descriptionSection",
            { opacity: 0 },
            { opacity: 1, duration: 0.4 }
        );

    } finally {
        analyzeBtn.textContent = "Analyze Breed";
        analyzeBtn.classList.remove("loading");
        analyzeBtn.disabled = false;
    }
});

// ---------------------
// 8. Scroll Reveal for Footer
// ---------------------
document.addEventListener("DOMContentLoaded", () => {
    const footerEls = document.querySelectorAll("#box2, #box3, #box4");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                gsap.fromTo(entry.target,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.55, delay: i * 0.08, ease: "power2.out" }
                );
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    footerEls.forEach(el => {
        gsap.set(el, { opacity: 0, y: 15 });
        observer.observe(el);
    });
});
