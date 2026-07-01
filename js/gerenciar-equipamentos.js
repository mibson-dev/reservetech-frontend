const token = localStorage.getItem("token");
const listaEquipamentos = document.querySelector("#lista-equipamentos");

function carregarEquipamentos() {
  fetch("https://reservetech-backend.onrender.com/dispositivos", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      listaEquipamentos.innerHTML = "";

      if (pagina.content.length === 0) {
        listaEquipamentos.innerHTML = "<p>Nenhum equipamento cadastrado.</p>";
        return;
      }

      pagina.content.forEach(function (equipamento) {
        const card = criarCardEquipamento(equipamento);
        listaEquipamentos.appendChild(card);
      });
    });
}

function criarCardEquipamento(equipamento) {
  const card = document.createElement("div");
  card.className = "card-reserva";

  card.innerHTML =
    "<strong>" +
    equipamento.nome +
    "</strong> — Qtd: " +
    equipamento.quantidadeDisponivel +
    "<br>" +
    (equipamento.descricao || "") +
    '<br><span class="status status-' +
    statusParaClasse(equipamento.status) +
    '">' +
    equipamento.status +
    "</span>";

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "Editar";
  btnEditar.className = "btn-editar";
  btnEditar.addEventListener("click", function () {
    abrirEdicao(card, equipamento);
  });

  const btnDeletar = document.createElement("button");
  btnDeletar.textContent = "Excluir";
  btnDeletar.className = "btn-remover-item";
  btnDeletar.style.width = "auto";
  btnDeletar.style.padding = "6px 12px";
  btnDeletar.addEventListener("click", function () {
    if (confirm("Tem certeza que deseja excluir esse equipamento?")) {
      deletarEquipamento(equipamento.id);
    }
  });

  card.appendChild(document.createElement("br"));
  card.appendChild(btnEditar);
  card.appendChild(btnDeletar);

  return card;
}

function statusParaClasse(status) {
  if (status === "DISPONIVEL") return "confirmada";
  if (status === "EM_MANUTENCAO") return "cancelada";
  return "pendente";
}

function abrirEdicao(card, equipamento) {
  card.innerHTML = "";

  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.value = equipamento.nome;

  const inputDescricao = document.createElement("input");
  inputDescricao.type = "text";
  inputDescricao.value = equipamento.descricao || "";

  const inputQuantidade = document.createElement("input");
  inputQuantidade.type = "number";
  inputQuantidade.min = "0";
  inputQuantidade.value = equipamento.quantidadeDisponivel;

  const selectStatus = document.createElement("select");
  ["DISPONIVEL", "EM_USO", "EM_MANUTENCAO"].forEach(function (status) {
    const opcao = document.createElement("option");
    opcao.value = status;
    opcao.textContent = status;
    if (status === equipamento.status) opcao.selected = true;
    selectStatus.appendChild(opcao);
  });

  const btnSalvar = document.createElement("button");
  btnSalvar.textContent = "Salvar";
  btnSalvar.className = "btn-submit";
  btnSalvar.addEventListener("click", function () {
    salvarEdicao(equipamento.id, {
      nome: inputNome.value,
      descricao: inputDescricao.value,
      quantidadeDisponivel: Number(inputQuantidade.value),
      status: selectStatus.value,
    });
  });

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.className = "btn-secundario";
  btnCancelar.addEventListener("click", carregarEquipamentos);

  [
    inputNome,
    inputDescricao,
    inputQuantidade,
    selectStatus,
    btnSalvar,
    btnCancelar,
  ].forEach(function (el) {
    card.appendChild(el);
    card.appendChild(document.createElement("br"));
  });
}

function salvarEdicao(id, dados) {
  fetch("https://reservetech-backend.onrender.com/dispositivos/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dados),
  }).then(function () {
    carregarEquipamentos();
  });
}

function deletarEquipamento(id) {
  fetch("https://reservetech-backend.onrender.com/dispositivos/" + id, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  }).then(function () {
    carregarEquipamentos();
  });
}

carregarEquipamentos();
