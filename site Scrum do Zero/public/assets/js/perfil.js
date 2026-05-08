const form = document.querySelector("form");
const cpf = document.getElementById("cpf");
const email = document.getElementById("email");
const senhaAtual = document.getElementById("senha-atual");
const novaSenha = document.getElementById("nova-senha");
const confirmarSenha = document.getElementById("confirmar-senha");

if (!form || !cpf || !email || !senhaAtual || !novaSenha || !confirmarSenha)
  return;

const mensagem = document.createElement("div");
mensagem.className = "mensagem";
mensagem.id = "mensagem";
form.parentNode.insertBefore(mensagem, form);

function setMsg(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
}

function limparMsg() {
  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

function validaEmail(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

function limpaCPF(valor) {
  return valor.replace(/\D/g, "");
}

function validaCPF(cpf) {
  cpf = limpaCPF(cpf);
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(cpf[10]);
}

function formatarCPF(valor) {
  valor = limpaCPF(valor).slice(0, 11);
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return valor;
}

cpf.addEventListener("input", () => {
  cpf.value = formatarCPF(cpf.value);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  limparMsg();

  const cpfVal = cpf.value.trim();
  const emailVal = email.value.trim();
  const senhaAtualVal = senhaAtual.value;
  const novaSenhaVal = novaSenha.value;
  const confirmarSenhaVal = confirmarSenha.value;

  if (!validaCPF(cpfVal)) return setMsg("CPF inválido.", "erro");
  if (!validaEmail(emailVal))
    return setMsg("E-mail em formato inválido.", "erro");
  if (senhaAtualVal !== "123456")
    return setMsg("Senha atual incorreta.", "erro");
  if (novaSenhaVal.length < 8)
    return setMsg("A nova senha deve ter no mínimo 8 caracteres.", "erro");
  if (novaSenhaVal !== confirmarSenhaVal)
    return setMsg("A nova senha e a confirmação não conferem.", "erro");

  setMsg("Dados validados com sucesso!", "sucesso");
});
