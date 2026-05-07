document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const mensagem = document.getElementById("mensagem");

  const nome = document.getElementById("nome");
  const sobrenome = document.getElementById("sobrenome");
  const cpf = document.getElementById("cpf");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmar = document.getElementById("confirmar");

  const campos = [nome, sobrenome, cpf, email, senha, confirmar];

  function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
    mensagem.style.display = "block";
  }

  function limparMensagem() {
    mensagem.textContent = "";
    mensagem.className = "mensagem";
    mensagem.style.display = "none";
  }

  function validarEmail(valor) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(valor);
  }

  function aplicarMascaraCPF(valor) {
    return valor
      .replace(/\D/g, "")
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);
  }

  cpf.addEventListener("input", () => {
    cpf.value = aplicarMascaraCPF(cpf.value);
  });

  campos.forEach((campo) => {
    campo.addEventListener("input", limparMensagem);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const vazio = campos.find((campo) => campo.value.trim() === "");
    if (vazio) {
      mostrarMensagem("Preencha todos os campos.", "erro");
      vazio.focus();
      return;
    }

    if (!validarEmail(email.value.trim())) {
      mostrarMensagem("Digite um e-mail válido.", "erro");
      email.focus();
      return;
    }

    if (senha.value !== confirmar.value) {
      mostrarMensagem("As senhas não conferem.", "erro");
      confirmar.focus();
      return;
    }

    mostrarMensagem("Cadastro realizado com sucesso!", "sucesso");
    form.reset();
  });
});