const form = document.querySelector("#form-login");
const mensagemErro = document.querySelector("#erro-login");

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const email = document.querySelector("#email").value;
  const senha = document.querySelector("#password").value;

  mensagemErro.textContent = "";

  fetch("https://reservetech-backend.onrender.com/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      senha: senha,
    }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Credenciais inválidas");
      }
      return response.text();
    })
    .then(function (token) {
      localStorage.setItem("token", token);

      fetch("https://reservetech-backend.onrender.com/usuarios/me", {
        headers: { Authorization: "Bearer " + token },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (usuario) {
          if (usuario.perfil === "TI") {
            window.location.href = "painel-ti.html";
          } else {
            window.location.href = "reservas.html";
          }
        });
    })
    .catch(function (erro) {
      mensagemErro.textContent = "E-mail ou senha incorretos.";
    });
});
