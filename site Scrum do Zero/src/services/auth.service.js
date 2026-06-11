const {
  findUsuarioByCpfAndSenha,
} = require("../repositories/usuarios.repository");
const { createToken } = require("../utils/jwt");
const { hashPassword } = require("../utils/password");
const {
  findUsuarioByEmail,
  criarRecuperacaoSenha,
  verificarCodigo,
  marcarComoUtilizado,
  atualizarSenha,
} = require("../repositories/password-recovery.repository");
const { enviarCodigoRecuperacao } = require("../utils/email");
const crypto = require("crypto");
const { addToken } = require("../utils/tokenBlacklist");

async function loginService(cpf, senha) {
  const usuario = await findUsuarioByCpfAndSenha(cpf, senha);
  const token = createToken({ id_usuario: usuario.id_usuario });
  return {
    token,
    nome: usuario.nome,
  };
}

function logoutService(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const [type, token] = authorizationHeader.split(" ");
  if (type !== "Bearer" || !token) {
    throw new Error("Token inválido");
  }

  addToken(token);
  return { message: "Logout realizado" };
}

async function forgotPasswordService(email) {
  const usuario = await findUsuarioByEmail(email);
  const codigo = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
  const token = crypto.randomBytes(32).toString("hex");

  await criarRecuperacaoSenha(usuario.id_usuario, email, codigo, token);
  await enviarCodigoRecuperacao(email, codigo);

  return {
    message: "Código enviado para o email",
    token,
  };
}

async function verifyCodeService(email, codigo) {
  const recovery = await verificarCodigo(email, codigo);
  return {
    message: "Código verificado com sucesso",
    recovery_id: recovery.id_recovery,
    id_usuario: recovery.id_usuario,
  };
}

async function resetPasswordService(recovery_id, id_usuario, nova_senha) {
  const senhaCriptografada = hashPassword(nova_senha);
  await atualizarSenha(id_usuario, senhaCriptografada);
  await marcarComoUtilizado(recovery_id);

  return { message: "Senha alterada com sucesso" };
}

module.exports = {
  loginService,
  logoutService,
  forgotPasswordService,
  verifyCodeService,
  resetPasswordService,
};
