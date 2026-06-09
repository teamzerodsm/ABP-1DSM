const { validarCpf } = require("../utils/cpf");
const {
  cadastrarUsuario,
  alterarCPF,
  alterarNome,
  alterarEmail,
  alterarSenha,
  obterUsuarioPorId,
} = require("../services/usuario.service");

async function createUsuarioController(req, res) {
  const { nome, email, cpf, senha } = req.body;
  if (!cpf || !nome || !senha) {
    return res.status(400).json({ message: "Informações inválidas" });
  }

  if (!validarCpf(cpf)) {
    return res
      .status(400)
      .json({ message: "CPF inválido. Digite um CPF válido com 11 números." });
  }

  if (senha.trim().length < 6) {
    return res
      .status(400)
      .json({ message: "A senha deve ter pelo menos 6 caracteres" });
  }

  try {
    const result = await cadastrarUsuario(nome, email, cpf, senha);
    return res.status(201).json(result);
  } catch (e) {
    if (e && e.code === "23505") {
      return res.status(409).json({
        message: "Já existe usuário com os dados informados",
      });
    }
    return res.status(500).json({
      message: "Problemas internos no servidor",
    });
  }
}

async function getUsuarioLogadoController(req, res) {
  try {
    const usuario = await obterUsuarioPorId(req.usuario.id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.status(200).json(usuario);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

async function updatePerfilController(req, res) {
  const idUsuario = req.usuario.id_usuario;
  const { nome, email, cpf } = req.body;

  if (!nome || !email || !cpf) {
    return res.status(400).json({ message: "Nome, e-mail e CPF são obrigatórios." });
  }

  if (!validarCpf(cpf)) {
    return res.status(400).json({ message: "Digite um CPF válido." });
  }

  try {
    if (nome) {
      await alterarNome(idUsuario, nome);
    }
    if (email) {
      await alterarEmail(idUsuario, email);
    }
    if (cpf) {
      await alterarCPF(idUsuario, cpf);
    }

    const usuario = await obterUsuarioPorId(idUsuario);
    return res.status(200).json(usuario);
  } catch (e) {
    if (e && e.code === "23505") {
      return res.status(409).json({ message: "Dados já utilizados por outro usuário" });
    }
    console.error(e);
    return res.status(500).json({ message: "Problemas internos no servidor" });
  }
}

async function updateCpfController(req, res) {
  const idUsuario = req.usuario.id_usuario;
  const { cpf } = req.body;
  if (!cpf) {
    return res.status(400).json({ message: "CPF é obrigatório" });
  }

  try {
    const usuario = await alterarCPF(idUsuario, cpf);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.status(200).json(usuario);
  } catch (e) {
    if (e && e.code === "23505") {
      return res.status(409).json({ message: "Já existe usuário com o CPF informado" });
    }
    console.error(e);
    return res.status(500).json({ message: "Problemas internos no servidor" });
  }
}

async function updateNomeController(req, res) {
  const idUsuario = req.usuario.id_usuario;
  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ message: "Nome é obrigatório" });
  }

  try {
    const usuario = await alterarNome(idUsuario, nome);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.status(200).json(usuario);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Problemas internos no servidor" });
  }
}

async function updateEmailController(req, res) {
  const idUsuario = req.usuario.id_usuario;
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório" });
  }

  try {
    const usuario = await alterarEmail(idUsuario, email);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.status(200).json(usuario);
  } catch (e) {
    if (e && e.code === "23505") {
      return res.status(409).json({ message: "Já existe usuário com o email informado" });
    }
    console.error(e);
    return res.status(500).json({ message: "Problemas internos no servidor" });
  }
}

async function updateSenhaController(req, res) {
  const idUsuario = req.usuario.id_usuario;
  const { senha } = req.body;

  if (!senha) {
    return res.status(400).json({ message: "Senha é obrigatória" });
  }
  if (senha.trim().length < 6) {
    return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
  }

  try {
    const usuario = await alterarSenha(idUsuario, senha);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.status(200).json(usuario);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Problemas internos no servidor" });
  }
}

module.exports = {
  createUsuarioController,
  getUsuarioLogadoController,
  updatePerfilController,
  updateCpfController,
  updateNomeController,
  updateEmailController,
  updateSenhaController,
};
