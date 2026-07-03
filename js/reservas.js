const token = localStorage.getItem("token");
const saudacao = document.querySelector("#saudacao");
const filtro = document.querySelector("#filtro");

fetch("https://reservetech-backend.onrender.com/usuarios/me", {
  headers: { Authorization: "Bearer " + token },
})
  .then(function (response) {
    return response.json();
  })
  .then(function (usuario) {
    const perfilTexto =
      usuario.perfil === "PROFESSOR" ? "Professor" : "Equipe TI";
    saudacao.textContent =
      "Bem-vindo, " + perfilTexto + " " + usuario.nome + "!";
  });

function carregarReservas(periodo) {
  let url = "https://reservetech-backend.onrender.com/reservas/minhas";
  if (periodo && periodo !== "todas") {
    url += "?periodo=" + periodo;
  }

  fetch(url, {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      const listaPendentes = document.querySelector("#lista-pendentes");
      const listaConfirmadas = document.querySelector("#lista-confirmadas");
      listaPendentes.innerHTML = "";
      listaConfirmadas.innerHTML = "";

      if (pagina.content.length === 0) {
        listaPendentes.innerHTML =
          "<p style='color:#999; font-size:14px;'>Nenhuma reserva pendente.</p>";
        listaConfirmadas.innerHTML =
          "<p style='color:#999; font-size:14px;'>Nenhuma reserva confirmada.</p>";
        return;
      }

      const pendentes = pagina.content
        .filter((r) => r.status === "PENDENTE")
        .sort((a, b) => new Date(a.dataReserva) - new Date(b.dataReserva));

      const confirmadas = pagina.content
        .filter((r) => r.status === "CONFIRMADA")
        .sort((a, b) => new Date(a.dataReserva) - new Date(b.dataReserva));

      if (pendentes.length === 0) {
        listaPendentes.innerHTML =
          "<p style='color:#999; font-size:14px;'>Nenhuma reserva pendente.</p>";
      } else {
        pendentes.forEach((r) => listaPendentes.appendChild(criarCard(r)));
      }

      if (confirmadas.length === 0) {
        listaConfirmadas.innerHTML =
          "<p style='color:#999; font-size:14px;'>Nenhuma reserva confirmada.</p>";
      } else {
        confirmadas.forEach((r) => listaConfirmadas.appendChild(criarCard(r)));
      }
    });
}

function criarCard(reserva) {
  const card = document.createElement("div");
  card.className = "card-reserva";

  const itensTexto = reserva.itens
    .map(function (item) {
      return item.nomeDispositivo + " (x" + item.quantidadeReservada + ")";
    })
    .join("<br>");

  card.innerHTML =
    "<strong>Sala:</strong> " +
    reserva.nomeSala +
    "<br>" +
    "<strong>Data:</strong> " +
    reserva.dataReserva +
    "<br>" +
    "<strong>Horário:</strong> " +
    reserva.horarioInicio.substring(0, 5) +
    " às " +
    reserva.horarioFim.substring(0, 5) +
    "<br>" +
    "<strong>Dispositivos:</strong><br>" +
    itensTexto +
    '<br><span class="status status-' +
    reserva.status.toLowerCase() +
    '">' +
    reserva.status +
    "</span>";

  return card;
}

filtro.addEventListener("change", function () {
  carregarReservas(filtro.value);
});

carregarReservas("todas");
