const token = localStorage.getItem("token");
const saudacao = document.querySelector("#saudacao");
const filtro = document.querySelector("#filtro");
const listaReservas = document.querySelector("#lista-reservas");

let todasReservas = [];
let usuarioLogadoId = null;

fetch("https://reservetech-backend.onrender.com/usuarios/me", {
  headers: { Authorization: "Bearer " + token },
})
  .then(function (response) {
    return response.json();
  })
  .then(function (usuario) {
    saudacao.textContent = "Bem-vindo, " + usuario.nome + "!";
    usuarioLogadoId = usuario.id;
    carregarReservas();
  });

function carregarReservas() {
  listaReservas.innerHTML = "<p>Carregando reservas...</p>";

  fetch(
    "https://reservetech-backend.onrender.com/reservas/usuario/" +
      usuarioLogadoId,
    {
      headers: { Authorization: "Bearer " + token },
    },
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      todasReservas = pagina.content;
      renderizarReservas();
    });
}

filtro.addEventListener("change", renderizarReservas);

function renderizarReservas() {
  listaReservas.innerHTML = "";
  const periodo = filtro.value;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const reservasFiltradas = todasReservas.filter(function (reserva) {
    if (periodo === "todas") return true;

    const dataReserva = new Date(reserva.dataReserva + "T00:00:00");
    const diffTempo = dataReserva.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTempo / (1000 * 3600 * 24));

    if (periodo === "hoje") {
      return diffDias === 0;
    }
    if (periodo === "semana") {
      return diffDias >= 0 && diffDias <= 7;
    }
    if (periodo === "mes") {
      return (
        dataReserva.getMonth() === hoje.getMonth() &&
        dataReserva.getFullYear() === hoje.getFullYear()
      );
    }
    if (periodo === "semestre") {
      return diffDias >= -180 && diffDias <= 180;
    }

    return true;
  });

  if (reservasFiltradas.length === 0) {
    listaReservas.innerHTML =
      "<p>Nenhuma reserva encontrada para este filtro.</p>";
    return;
  }

  reservasFiltradas.forEach(function (reserva) {
    const card = document.createElement("div");
    card.className = "card-reserva";

    const itensTexto = reserva.itens
      .map(function (item) {
        return item.nomeDispositivo + " (x" + item.quantidadeReservada + ")";
      })
      .join(", ");

    card.innerHTML =
      "<strong>Sala: " +
      reserva.nomeSala +
      "</strong><br>" +
      "Data: " +
      reserva.dataReserva +
      " — " +
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
      const btnCancelar = document.createElement("button");
      btnCancelar.textContent = "Cancelar";
      btnCancelar.className = "btn-remover-item";
      btnCancelar.style.width = "auto";
      btnCancelar.style.padding = "6px 12px";
      btnCancelar.style.marginTop = "10px";
      btnCancelar.addEventListener("click", function () {
        if (confirm("Deseja realmente cancelar esta reserva?")) {
          cancelarReserva(reserva.id);
        }
      });
      card.appendChild(document.createElement("br"));
      card.appendChild(btnCancelar);
    }

    listaReservas.appendChild(card);
  });
}

function cancelarReserva(reservaId) {
  fetch("https://reservetech-backend.onrender.com/reservas/" + reservaId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ status: "CANCELADA" }),
  }).then(function () {
    carregarReservas();
  });
}
