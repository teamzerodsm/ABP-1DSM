const {
  obterHistoricoProgresso,
} = require("../services/progresso.service");

async function obterHistoricoProgressoController(req, res) {
  try {
    const history = await obterHistoricoProgresso(req.usuario.id_usuario);
    return res.status(200).json(history);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

module.exports = {
  obterHistoricoProgressoController,
};
