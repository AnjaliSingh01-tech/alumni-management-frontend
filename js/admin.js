const token = localStorage.getItem("token");

fetch("http://alumni-backend-folder.onrender.com/api/admin", {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(res => res.json())
.then(data => {
  console.log(data);
})
.catch(err => console.log(err));
