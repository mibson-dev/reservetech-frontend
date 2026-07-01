function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

function exigirAutenticacao() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Acesso negado! Por favor, faça login.");
    window.location.href = "login.html";
  }
}

exigirAutenticacao();

document.addEventListener("DOMContentLoaded", function () {
  const btnLogout = document.querySelector("#btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", logout);
  }
});
