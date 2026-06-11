document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  const mensagem = document.getElementById("mensagem");
  const nome = document.getElementById("nome");
  const sobrenome = document.getElementById("sobrenome");
  const cpf = document.getElementById("cpf");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmar = document.getElementById("confirmar");

  const campos = [nome, sobrenome, cpf, email, senha, confirmar];
  const apiUrl = "/api/usuarios";

  const limparMensagem = () => {
    mensagem.textContent = "";
    mensagem.className = "cadastro-mensagem";
    mensagem.style.display = "none";
  };

  const mostrarMensagem = (texto, tipo) => {
    mensagem.textContent = texto;
    mensagem.className = `cadastro-mensagem ${tipo}`;
    mensagem.style.display = "block";
  };

  const validarEmail = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  const validarCpf = (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    let soma = 0;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

    return true;
  };

  const aplicarMascaraCPF = (valor) =>
    valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);

  cpf.addEventListener("input", () => {
    cpf.value = aplicarMascaraCPF(cpf.value);
  });

  campos.forEach((campo) => campo.addEventListener("input", limparMensagem));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nomeVal = nome.value.trim();
    const sobrenomeVal = sobrenome.value.trim();
    const cpfVal = cpf.value.trim();
    const emailVal = email.value.trim();
    const senhaVal = senha.value;
    const confirmarVal = confirmar.value;

    const vazio = campos.find((campo) => campo.value.trim() === "");
    if (vazio) {
      mostrarMensagem("Preencha todos os campos.", "erro");
      vazio.focus();
      return;
    }

    if (cpfVal.replace(/\D/g, "").length !== 11) {
      mostrarMensagem("Digite um CPF válido com 11 números.", "erro");
      cpf.focus();
      return;
    }

    if (!validarCpf(cpfVal)) {
      mostrarMensagem("CPF inválido. Digite um CPF válido.", "erro");
      cpf.focus();
      return;
    }

    if (!validarEmail(emailVal)) {
      mostrarMensagem("Digite um e-mail válido.", "erro");
      email.focus();
      return;
    }

    if (senhaVal.length < 6) {
      mostrarMensagem("A senha deve ter pelo menos 6 caracteres.", "erro");
      senha.focus();
      return;
    }

    if (senhaVal !== confirmarVal) {
      mostrarMensagem("As senhas não conferem.", "erro");
      confirmar.focus();
      return;
    }

    try {
      const resposta = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: `${nomeVal} ${sobrenomeVal}`.trim(),
          email: emailVal,
          cpf: cpfVal,
          senha: senhaVal,
        }),
      });

      const data = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          data.message || "Não foi possível concluir o cadastro.",
        );
      }

      mostrarMensagem(
        "Cadastro realizado com sucesso! Redirecionando para o login...",
        "sucesso",
      );
      form.reset();
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 1500);
    } catch (error) {
      mostrarMensagem(
        error.message || "Erro ao conectar com o servidor.",
        "erro",
      );
    }
  });

  // Lógica para mostrar/esconder senha em ambos os inputs
  const eyeButtons = document.querySelectorAll(".lnr-eye");
  eyeButtons.forEach((eyeBtn) => {
    eyeBtn.addEventListener("click", () => {
      const container = eyeBtn.closest(".password-input-container");
      const inputPassword = container.querySelector("input[type='password'], input[type='text']");

      if (inputPassword.getAttribute("type") === "password") {
        inputPassword.setAttribute("type", "text");
        eyeBtn.setAttribute("src", "assets/img/hidePassword.png");
      } else {
        inputPassword.setAttribute("type", "password");
        eyeBtn.setAttribute("src", "assets/img/showPassword.png");
      }
    });
  });
});
