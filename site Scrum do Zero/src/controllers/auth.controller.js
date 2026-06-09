const {
  loginService,
  logoutService,
  forgotPasswordService,
  verifyCodeService,
  resetPasswordService,
} = require("../services/auth.service");

async function loginController(req, res) {
  const { cpf, senha } = req.body;
  if (!cpf || !senha) {
    return res.status(400).json({ message: "CPF ou senha inválidos" });
  }
  try {
    const result = await loginService(cpf, senha);
    return res.status(200).json(result);
  } catch (e) {
    const invalidCredentials =
      e.message === "Usuário não encontrado" || e.message === "Senha inválida";
    return res
      .status(invalidCredentials ? 401 : 500)
      .json({ message: e.message });
  }
}

function logoutController(req, res) {
  const authorization = req.headers.authorization;
  try {
    const result = logoutService(authorization);
    if (!result) {
      return res.status(204).send();
    }
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

async function forgotPasswordController(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório" });
  }

  try {
    const result = await forgotPasswordService(email);
    return res.status(200).json(result);
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
    const result = await verifyCodeService(email, codigo);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res
      .status(400)
      .json({ message: e.message || "Erro ao verificar código" });
  }
}

async function resetPasswordController(req, res) {
  const { recovery_id, id_usuario, nova_senha } = req.body;
  if (!recovery_id || !id_usuario || !nova_senha) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios" });
  }

  if (nova_senha.length < 6) {
    return res
      .status(400)
      .json({ message: "Senha deve ter no mínimo 6 caracteres" });
  }

  try {
    const result = await resetPasswordService(recovery_id, id_usuario, nova_senha);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ message: e.message || "Erro ao resetar senha" });
  }
}

module.exports = {
  loginController,
  logoutController,
  forgotPasswordController,
  verifyCodeController,
  resetPasswordController,
};
