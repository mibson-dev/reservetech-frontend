const token = localStorage.getItem("token");
const selectSala = document.querySelector("#sala");
const selectHorarioInicio = document.querySelector("#horario-inicio");
const selectHorarioFim = document.querySelector("#horario-fim");
const listaItens = document.querySelector("#lista-itens");
const btnAdicionarItem = document.querySelector("#btn-adicionar-item");
const form = document.querySelector("#form-reserva");
const mensagemErro = document.querySelector("#erro-reserva");

let dispositivosDisponiveis = [];

function preencherHorarios(select) {
  for (let hora = 0; hora < 24; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      const horaTexto = String(hora).padStart(2, "0");
      const minutoTexto = String(minuto).padStart(2, "0");
      const valor = horaTexto + ":" + minutoTexto;

      const opcao = document.createElement("option");
      opcao.value = valor;
      opcao.textContent = valor;
      select.appendChild(opcao);
    }
  }
}

preencherHorarios(selectHorarioInicio);
preencherHorarios(selectHorarioFim);

fetch("https://reservetech-backend.onrender.com/salas", {
  headers: { Authorization: "Bearer " + token },
})
  .then(function (response) {
    return response.json();
  })
  .then(function (pagina) {
    selectSala.innerHTML =
      '<option value="" disabled selected>Selecione uma sala...</option>';
    pagina.content.forEach(function (sala) {
      const opcao = document.createElement("option");
      opcao.value = sala.id;
      opcao.textContent = sala.nome + " (" + sala.andar + ")";
      selectSala.appendChild(opcao);
    });
  });

fetch("https://reservetech-backend.onrender.com/dispositivos", {
  headers: { Authorization: "Bearer " + token },
})
  .then(function (response) {
    return response.json();
  })
  .then(function (pagina) {
    dispositivosDisponiveis = pagina.content;
    criarLinhaItem();
  });

function criarLinhaItem() {
  const linha = document.createElement("div");
  linha.className = "linha-item";

  const select = document.createElement("select");
  select.className = "select-dispositivo";
  select.innerHTML = '<option value="" disabled selected>Selecione...</option>';
  dispositivosDisponiveis.forEach(function (dispositivo) {
    const opcao = document.createElement("option");
    opcao.value = dispositivo.id;
    opcao.textContent = dispositivo.nome;
    select.appendChild(opcao);
  });

  const inputQuantidade = document.createElement("input");
  inputQuantidade.type = "number";
  inputQuantidade.className = "input-quantidade";
  inputQuantidade.min = "1";
  inputQuantidade.placeholder = "Qtd";
  inputQuantidade.value = "1";

  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.className = "btn-remover-item";
  btnRemover.textContent = "×";
  btnRemover.addEventListener("click", function () {
    linha.remove();
  });

  linha.appendChild(select);
  linha.appendChild(inputQuantidade);
  linha.appendChild(btnRemover);
  listaItens.appendChild(linha);
}

btnAdicionarItem.addEventListener("click", criarLinhaItem);

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const salaId = selectSala.value;
  const data = document.querySelector("#data").value;
  const horarioInicio = document.querySelector("#horario-inicio").value;
  const horarioFim = document.querySelector("#horario-fim").value;

  // Validação 1: Data retroativa
  const dataAtual = new Date();
  dataAtual.setHours(0, 0, 0, 0);
  const dataEscolhida = new Date(data + "T00:00:00");

  if (dataEscolhida < dataAtual) {
    mensagemErro.textContent = "Não é possível selecionar uma data no passado.";
    return;
  }

  // Validação 2: Horário de fim inválido
  if (horarioFim <= horarioInicio) {
    mensagemErro.textContent =
      "O horário de término deve ser posterior ao horário de início.";
    return;
  }

  const linhas = document.querySelectorAll(".linha-item");
  const itens = Array.from(linhas).map(function (linha) {
    const dispositivoId = linha.querySelector(".select-dispositivo").value;
    const quantidade = linha.querySelector(".input-quantidade").value;
    return {
      dispositivoId: Number(dispositivoId),
      quantidadeReservada: Number(quantidade),
    };
  });

  const dadosReserva = {
    salaId: Number(salaId),
    dataReserva: data,
    horarioInicio: horarioInicio + ":00",
    horarioFim: horarioFim + ":00",
    itens: itens,
  };

  fetch("https://reservetech-backend.onrender.com/reservas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dadosReserva),
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem);
        });
      }
      return response.json();
    })
    .then(function () {
      alert("Reserva criada com sucesso!");
      window.location.href = "reservas.html";
    })
    .catch(function (erro) {
      mensagemErro.textContent = erro.message;
    });
});
