document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // FORM SUBMIT (UPLOAD IMAGE)
    // =========================

    const galleryForm = document.getElementById("galleryForm");

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Login first");
        window.location.href = "login.html";
        return;
    }

    // =========================
    // UPLOAD NEW GALLERY ITEM
    // =========================

    if (galleryForm) {

        galleryForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const title = document.getElementById("title").value.trim();

            const category = document.getElementById("category").value.trim();

            const description = document.getElementById("description").value.trim();

            const file = document.getElementById("imageFile").files[0];

            if (!file) {
                alert("Select image first");
                return;
            }

            try {

                // =========================
                // STEP 1: UPLOAD IMAGE
                // =========================

                const formData = new FormData();

                formData.append("image", file);

                const uploadRes = await fetch(
                    "http://alumni-backend-folder.onrender.com/api/upload",
                    {
                        method: "POST",
                        body: formData
                    }
                );

                const uploadData = await uploadRes.json();

                console.log("Upload Response:", uploadData);

                if (!uploadData.imageUrl) {
                    alert("Image upload failed");
                    return;
                }

                const image_url = uploadData.imageUrl;

                // =========================
                // STEP 2: SAVE TO DATABASE
                // =========================

                const res = await fetch(
                    "http://alumni-backend-folder.onrender.com/api/gallery/post",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title,
                            category,
                            description,
                            image_url
                        })
                    }
                );

                const data = await res.json();

                console.log("DB Response:", data);

                if (data.success) {

                    alert("Uploaded successfully");

                    galleryForm.reset();

                    window.location.href = "gallery.html";

                } else {

                    alert(data.message || "Failed");

                }

            } catch (err) {

                console.error("UPLOAD ERROR:", err);

                alert("Server error");

            }

        });

    }

    // =========================
    // LOAD GALLERY ITEMS
    // =========================

    const galleryContainer = document.getElementById("galleryContainer");

    if (galleryContainer) {

        loadGallery();

    }

    // =========================
    // FUNCTION: LOAD GALLERY
    // =========================

    async function loadGallery() {

        try {

            galleryContainer.innerHTML = "<h2>Loading...</h2>";

            const res = await fetch(
                "http://alumni-backend-folder.onrender.com/api/gallery/all"
            );

            const data = await res.json();

            console.log("Gallery Data:", data);

            galleryContainer.innerHTML = "";

            if (data.success && data.gallery.length > 0) {

                data.gallery.forEach(item => {

                    const div = document.createElement("div");

                    div.classList.add("gallery-card");

                    div.innerHTML = `
                        <img 
                            src="${item.image_url}" 
                            alt="${item.title}" 
                            class="gallery-img"
                        >

                        <h3>${item.title}</h3>

                        <p><strong>Category:</strong> ${item.category}</p>

                        <p>${item.description || ""}</p>

                        <small>
                            Posted by: ${item.posted_by_name || "Unknown"}
                        </small>

                        <div class="gallery-buttons">

                            <button onclick="editGallery(${item.id})">
                                Edit
                            </button>

                            <button onclick="deleteGallery(${item.id})">
                                Delete
                            </button>

                        </div>
                    `;

                    galleryContainer.appendChild(div);

                });

            } else {

                galleryContainer.innerHTML =
                    "<h3>No gallery items found</h3>";

            }

        } catch (err) {

            console.error("LOAD ERROR:", err);

            galleryContainer.innerHTML =
                "<h3>Failed to load gallery</h3>";

        }

    }

    // =========================
    // DELETE GALLERY ITEM
    // =========================

    async function deleteGallery(id) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this item?"
        );

        if (!confirmDelete) return;

        try {

            const res = await fetch(
                `http://alumni-backend-folder.onrender.com/api/gallery/delete/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await res.json();

            if (data.success) {

                alert("Deleted successfully");

                location.reload();

            } else {

                alert("Delete failed");

            }

        } catch (err) {

            console.error(err);

        }

    }

    // =========================
    // EDIT GALLERY ITEM
    // =========================

    async function editGallery(id) {

        const title = prompt("Enter new title");

        const category = prompt("Enter new category");

        const description = prompt("Enter new description");

        if (!title || !category || !description) {
            alert("All fields required");
            return;
        }

        try {

            const res = await fetch(
                `http://alumni-backend-folder.onrender.com/api/gallery/edit/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title,
                        category,
                        description
                    })

                }
            );

            const data = await res.json();

            if (data.success) {

                alert("Updated successfully");

                location.reload();

            } else {

                alert("Update failed");

            }

        } catch (err) {

            console.error(err);

        }

    }

    // =========================
    // MAKE FUNCTIONS GLOBAL
    // =========================

    window.deleteGallery = deleteGallery;
    window.editGallery = editGallery;

});