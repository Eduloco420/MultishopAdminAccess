document.addEventListener("DOMContentLoaded", function () {
    fetch("sidebar.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("sidebar-container").innerHTML = data;
      })
      .catch(error => console.error("Error al cargar el sidebar:", error));
  });