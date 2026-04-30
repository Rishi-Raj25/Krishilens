var tl = gsap.timeline()

tl.from("#navbar h2",{
    y:-30,
    opacity:0,
    duration:1,
    dealy:1
})

tl.from("#navbar img",{
    y:+20,
    opacity:0,
    duration:1,
    scale:0.2
})


const fileInput = document.getElementById("fileInput");
const gallery = document.getElementById("gallery");
const addPhoto = document.getElementById("addPhoto");
const analyzeBtn = document.getElementById("analyzeBtn");
const breedName = document.getElementById("breedName");
const breedDescription = document.getElementById("breedDescription");
const confidenceScore = document.getElementById("confidenceScore");

// When gallery icon is clicked, open file explorer
gallery.addEventListener("click", (e) => {
    e.preventDefault();
    fileInput.click();
});

// When file is selected, display it inside #addPhoto
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
            
            analyzeBtn.style.display = "block";
            gsap.from(analyzeBtn, { y: 20, opacity: 0, duration: 0.5 });
        }
        reader.readAsDataURL(file);
    }
});

// Analyze Breed functionality
analyzeBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    analyzeBtn.textContent = "Analyzing...";
    analyzeBtn.classList.add("loading");
    analyzeBtn.disabled = true;

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
        breedDescription.innerHTML = ""; // Clear existing list
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
        
        gsap.from("#similaritySection, #descriptionSection", {

            opacity: 0,
            y: 20,
            stagger: 0.2,
            duration: 0.8
        });

    } catch (error) {
        console.error("Error:", error);
        breedName.textContent = "Analysis Failed";
        confidenceScore.textContent = "";
        breedDescription.textContent = "Please ensure the server is running on port 5001.";
    } finally {
        analyzeBtn.textContent = "Analyze Breed";
        analyzeBtn.classList.remove("loading");
        analyzeBtn.disabled = false;
    }
});

