const token = localStorage.getItem("token");
const saudacao = document.querySelector("#saudacao");
const listaReservas = document.querySelector("#lista-reservas");
const filtroStatus = document.querySelector("#filtro-status");

fetch("https://reservetech-backend.onrender.com/usuarios/me", {
  headers: { Authorization: "Bearer " + token },
})
  .then(function (response) {
    return response.json();
  })
  .then(function (usuario) {
    saudacao.textContent = "Bem-vindo, " + usuario.nome + "!";
  });

function carregarReservas(status) {
  let url = "https://reservetech-backend.onrender.com/reservas";
  if (status && status !== "todas") {
    url += "?status=" + status;
  }

  fetch(url, {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      listaReservas.innerHTML = "";

      if (pagina.content.length === 0) {
        listaReservas.innerHTML = "<p>Nenhuma reserva encontrada.</p>";
        return;
      }

      pagina.content.forEach(function (reserva) {
        const card = document.createElement("div");
        card.className = "card-reserva";

        const itensTexto = reserva.itens
          .map(function (item) {
            return (
              item.nomeDispositivo + " (x" + item.quantidadeReservada + ")"
            );
          })
          .join(", ");

        card.innerHTML =
          "<strong>" +
          reserva.nomeUsuario +
          "</strong> — " +
          reserva.nomeSala +
          " — " +
          reserva.dataReserva +
          " " +
          reserva.horarioInicio.substring(0, 5) +
          " às " +
          reserva.horarioFim.substring(0, 5) +
          "<br>Itens: " +
          itensTexto +
          '<br><span class="status status-' +
          reserva.status.toLowerCase() +
          '">' +
          reserva.status +
          "</span>";

        if (reserva.status === "PENDENTE") {
          const btnConfirmar = document.createElement("button");
          btnConfirmar.textContent = "Confirmar";
          btnConfirmar.className = "btn-confirmar-painel";
          btnConfirmar.addEventListener("click", function () {
            atualizarStatus(reserva.id, "CONFIRMADA", status);
          });

          const btnCancelar = document.createElement("button");
          btnCancelar.textContent = "Cancelar";
          btnCancelar.className = "btn-remover-item";
          btnCancelar.style.width = "auto";
          btnCancelar.style.padding = "6px 12px";
          btnCancelar.addEventListener("click", function () {
            atualizarStatus(reserva.id, "CANCELADA", status);
          });

          card.appendChild(document.createElement("br"));
          card.appendChild(btnConfirmar);
          card.appendChild(btnCancelar);
        }

        listaReservas.appendChild(card);
      });
    });
}

function atualizarStatus(reservaId, novoStatus, filtroAtual) {
  fetch("https://reservetech-backend.onrender.com/reservas/" + reservaId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ status: novoStatus }),
  }).then(function () {
    carregarReservas(filtroAtual);
  });
}

filtroStatus.addEventListener("change", function () {
  carregarReservas(filtroStatus.value);
});

carregarReservas("todas");
