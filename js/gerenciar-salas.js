const token = localStorage.getItem("token");
const listaSalas = document.querySelector("#lista-salas");

function carregarSalas() {
  fetch("https://reservetech-backend.onrender.com/salas", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      listaSalas.innerHTML = "";

      if (pagina.content.length === 0) {
        listaSalas.innerHTML = "<p>Nenhuma sala cadastrada.</p>";
        return;
      }

      pagina.content.forEach(function (sala) {
        listaSalas.appendChild(criarCardSala(sala));
      });
    });
}

function criarCardSala(sala) {
  const card = document.createElement("div");
  card.className = "card-reserva";

  card.innerHTML = "<strong>" + sala.nome + "</strong> — " + sala.andar;

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "Editar";
  btnEditar.className = "btn-editar";
  btnEditar.addEventListener("click", function () {
    abrirEdicao(card, sala);
  });

  const btnDeletar = document.createElement("button");
  btnDeletar.textContent = "Excluir";
  btnDeletar.className = "btn-remover-item";
  btnDeletar.style.width = "auto";
  btnDeletar.style.padding = "6px 12px";
  btnDeletar.addEventListener("click", function () {
    if (confirm("Tem certeza que deseja excluir essa sala?")) {
      deletarSala(sala.id);
    }
  });

  card.appendChild(document.createElement("br"));
  card.appendChild(btnEditar);
  card.appendChild(btnDeletar);

  return card;
}

function abrirEdicao(card, sala) {
  card.innerHTML = "";

  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.value = sala.nome;

  const inputAndar = document.createElement("input");
  inputAndar.type = "text";
  inputAndar.value = sala.andar;

  const btnSalvar = document.createElement("button");
  btnSalvar.textContent = "Salvar";
  btnSalvar.className = "btn-submit";
  btnSalvar.addEventListener("click", function () {
    salvarEdicao(sala.id, {
      nome: inputNome.value,
      andar: inputAndar.value,
    });
  });

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.className = "btn-secundario";
  btnCancelar.addEventListener("click", carregarSalas);

  [inputNome, inputAndar, btnSalvar, btnCancelar].forEach(function (el) {
    card.appendChild(el);
    card.appendChild(document.createElement("br"));
  });
}

function salvarEdicao(id, dados) {
  fetch("https://reservetech-backend.onrender.com/salas/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dados),
  }).then(function () {
    carregarSalas();
  });
}

function deletarSala(id) {
  fetch("https://reservetech-backend.onrender.com/salas/" + id, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  }).then(function () {
    carregarSalas();
  });
}

carregarSalas();
