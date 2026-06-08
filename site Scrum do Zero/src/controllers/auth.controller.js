const { findUsuarioByCpfAndSenha } = require("../repositories/usuarios.repository");
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

async function loginController(req, res) {
  const { cpf, senha } = req.body;
  if (!cpf || !senha) {
    return res.status(400).json({ message: "CPF ou senha inválidos" });
  }
  try {
    const usuario = await findUsuarioByCpfAndSenha(cpf, senha);
    const token = createToken({ id_usuario: usuario.id_usuario });
    return res.status(200).json({ token, nome: usuario.nome });
  } catch (e) {
    const invalidCredentials =
      e.message === "Usuário não encontrado" || e.message === "Senha inválida";
    return res.status(invalidCredentials ? 401 : 500).json({ message: e.message });
  }
}

function logoutController(req, res) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(204).send();
  }

  const [type, token] = authorization.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(400).json({ message: "Token inválido" });
  }

  addToken(token);
  return res.status(200).json({ message: "Logout realizado" });
}

async function forgotPasswordController(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório" });
  }

  try {
    const usuario = await findUsuarioByEmail(email);
    const codigo = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
    const token = crypto.randomBytes(32).toString("hex");
    await criarRecuperacaoSenha(usuario.id_usuario, email, codigo, token);
    await enviarCodigoRecuperacao(email, codigo);
    return res.status(200).json({ message: "Código enviado para o email", token });
  } catch (e) {
    console.error(e);
    return res
      .status(e.message === "Usuário não encontrado com este email" ? 404 : 500)
      .json({ message: e.message || "Erro ao processar solicitação" });
  }
}

async function verifyCodeController(req, res) {
  const { email, codigo } = req.body;
  if (!email || !codigo) {
    return res.status(400).json({ message: "Email e código são obrigatórios" });
  }

  try {
    const recovery = await verificarCodigo(email, codigo);
    return res.status(200).json({
      message: "Código verificado com sucesso",
      recovery_id: recovery.id_recovery,
      id_usuario: recovery.id_usuario,
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: e.message || "Erro ao verificar código" });
  }
}

async function resetPasswordController(req, res) {
  const { recovery_id, id_usuario, nova_senha } = req.body;
  if (!recovery_id || !id_usuario || !nova_senha) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  if (nova_senha.length < 6) {
    return res.status(400).json({ message: "Senha deve ter no mínimo 6 caracteres" });
  }

  try {
    const senhaCriptografada = hashPassword(nova_senha);
    await atualizarSenha(id_usuario, senhaCriptografada);
    await marcarComoUtilizado(recovery_id);
    return res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || "Erro ao resetar senha" });
  }
}

module.exports = {
  loginController,
  logoutController,
  forgotPasswordController,
  verifyCodeController,
  resetPasswordController,
};