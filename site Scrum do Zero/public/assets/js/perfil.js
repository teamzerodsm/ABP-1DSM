const API_URL = "/api/usuarios";

let form;
let nomeInput;
let sobrenomeInput;
let cpfInput;
let emailInput;
let currentPasswordInput;
let newPasswordInput;
let confirmPasswordInput;
let cancelButton;
let mensagem;

function formatCpf(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

function splitName(fullName) {
  const parts = fullName.trim().split(" ");
  return {
    firstName: parts.shift() || "",
    lastName: parts.join(" ") || ""
  };
}

async function carregarUsuario() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/index";
    return;
  }

  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/index";
    return;
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar os dados do usuário.");
  }

  const usuario = await response.json();
  const nomes = splitName(usuario.nome);

  nomeInput.value = nomes.firstName;
  sobrenomeInput.value = nomes.lastName;
  emailInput.value = usuario.email;
  cpfInput.value = formatCpf(usuario.cpf);
  document.querySelector(".user-name").textContent = usuario.nome;
  document.querySelector(".user-email").textContent = usuario.email;
}

function mostrarMensagem(texto, tipo) {
  if (!mensagem) return;
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
}

function limparMensagem() {
  if (!mensagem) return;
  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

async function atualizarDados(event) {
  event.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/index";
    return;
  }

  const nome = nomeInput.value.trim();
  const sobrenome = sobrenomeInput.value.trim();
  const cpf = cpfInput.value.replace(/\D/g, "").trim();
  const email = emailInput.value.trim();
  const senhaAtual = currentPasswordInput.value;
  const novaSenha = newPasswordInput.value;
  const confirmarSenha = confirmPasswordInput.value;

  limparMensagem();
  if (!nome || !sobrenome || !cpf || !email) {
    mostrarMensagem("Preencha nome, sobrenome, CPF e e-mail.", "erro");
    return;
  }

  if (cpf.length !== 11) {
    mostrarMensagem("Digite um CPF válido com 11 números.", "erro");
    cpfInput.focus();
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarMensagem("Digite um e-mail válido.", "erro");
    emailInput.focus();
    return;
  }

  const payload = {
    nome: `${nome} ${sobrenome}`.trim(),
    email,
    cpf
  };

  if (novaSenha || confirmarSenha || senhaAtual) {
    if (!senhaAtual) {
      alert("Digite sua senha atual para alterar a senha.");
      currentPasswordInput.focus();
      return;
    }
    if (novaSenha.trim().length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres.");
      newPasswordInput.focus();
      return;
    }
    if (novaSenha !== confirmarSenha) {
      alert("As senhas não conferem.");
      confirmPasswordInput.focus();
      return;
    }

    payload.senhaAtual = senhaAtual;
    payload.novaSenha = novaSenha;
    payload.confirmarSenha = confirmarSenha;
  }

  const response = await fetch(`${API_URL}/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    mostrarMensagem(data.message || "Não foi possível atualizar os dados.", "erro");
    return;
  }

  mostrarMensagem("Dados atualizados com sucesso! Redirecionando para a home...", "sucesso");
  currentPasswordInput.value = "";
  newPasswordInput.value = "";
  confirmPasswordInput.value = "";
  await carregarUsuario();
  setTimeout(() => {
    window.location.href = "/main";
  }, 1500);
}

function inicializarEventos() {
  form.addEventListener("submit", atualizarDados);
  cancelButton.addEventListener("click", () => {
    window.location.href = "/main";
  });

  cpfInput.addEventListener("input", () => {
    cpfInput.value = formatCpf(cpfInput.value);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  form = document.querySelector("form");
  nomeInput = document.querySelector("#nome");
  sobrenomeInput = document.querySelector("#sobrenome");
  cpfInput = document.querySelector("#cpf");
  emailInput = document.querySelector("#email");
  currentPasswordInput = document.querySelector("#senha-atual");
  newPasswordInput = document.querySelector("#nova-senha");
  confirmPasswordInput = document.querySelector("#confirmar-senha");
  cancelButton = document.querySelector(".actions button[type='button']");
  mensagem = document.querySelector("#perfil-mensagem");

  inicializarEventos();
  try {
    await carregarUsuario();
  } catch (error) {
    console.error(error);
    alert("Não foi possível carregar seus dados. Faça login novamente.");
    window.location.href = "/index";
  }
});

