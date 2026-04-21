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
            gallery.src = e.target.result; // replace placeholder with uploaded image
            gallery.style.position = "static"; // reset absolute positioning
            gallery.style.width = "100%";
            gallery.style.height = "100%";
            gallery.style.objectFit = "cover"; // make it fit nicely
        }
        reader.readAsDataURL(file);
    }
});
