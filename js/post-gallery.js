document.addEventListener("DOMContentLoaded", () => {
    const galleryForm = document.getElementById("galleryForm");

    if (!galleryForm) return;

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    galleryForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const category = document.getElementById("category").value.trim();
        const description = document.getElementById("description").value.trim();
        const file = document.getElementById("imageFile").files[0];

        if (!file) {
            alert("Please select an image");
            return;
        }

        try {
            // 🔥 STEP 1: Upload image to backend (Cloudinary)
            const formData = new FormData();
            formData.append("image", file);

            const uploadRes = await fetch("http://https://alumni-backend-folder.onrender.com/api/upload", {
                method: "POST",
                body: formData
            });

            const uploadData = await uploadRes.json();

            if (!uploadData.imageUrl) {
                alert("Image upload failed");
                return;
            }

            const image_url = uploadData.imageUrl;

            // 🔥 STEP 2: Send gallery data to backend
            const response = await fetch("http://https://alumni-backend-folder.onrender.com/api/gallery/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    category,
                    image_url,
                    description
                })
            });

            const data = await response.json();

            if (data.success) {
                alert("Gallery item posted successfully!");
                galleryForm.reset();
                window.location.href = "gallery.html";
            } else {
                alert(data.message || "Gallery posting failed");
            }

        } catch (error) {
            console.error("Gallery Post Error:", error);
            alert("Server error. Please try again.");
        }
    });
});