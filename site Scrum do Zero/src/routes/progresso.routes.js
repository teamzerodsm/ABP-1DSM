const { Router } = require("express");
const authmiddleware = require("../middlewares/auth.middleware");
<<<<<<< Updated upstream
const {
  findHistoricoExamesPorUsuario,
  findResumoProgressoPorModulo,
  findProgressoGeral,
  findTentativasDisponiveisPorModulo,
} = require("../repositories/progresso.repositories");
=======
const { findExamHistoryByUsuario, getMediaGeralStatus } = require("../repositories/progresso.repositories");
>>>>>>> Stashed changes

const router = Router();

/**
 * GET /api/progresso/tentativas
 * Retorna histórico detalhado de exames do usuário
 */
router.get("/tentativas", authmiddleware, async function (req, res) {
  try {
    const historico = await findHistoricoExamesPorUsuario(req.usuario.id_usuario);

    // Agrupa por módulo para compatibilidade com frontend
    const modulosMap = new Map();
    historico.forEach((exame) => {
      if (!modulosMap.has(exame.id_modulo)) {
        modulosMap.set(exame.id_modulo, {
          id_modulo: exame.id_modulo,
          modulo: exame.modulo,
          tentativas: [],
          max_tentativas: 2,
        });
      }

      modulosMap.get(exame.id_modulo).tentativas.push({
        id_exame: exame.id_exame,
        grupo: exame.grupo,
        tentativa: exame.tentativa,
        respostas_respondidas: Number(exame.respostas_respondidas) || 0,
        nota: Number(exame.nota) || 0,
        total_questoes: Number(exame.total_questoes) || 0,
        data_exame: exame.data_exame,
      });
    });

    const resultado = Array.from(modulosMap.values()).map((modulo) => ({
      ...modulo,
      tentativas_restantes: modulo.max_tentativas - modulo.tentativas.length,
    }));

<<<<<<< Updated upstream
    return res.status(200).json(resultado);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/progresso/resumo
 * Retorna resumo consolidado por módulo
 */
router.get("/resumo", authmiddleware, async function (req, res) {
  try {
    const resumo = await findResumoProgressoPorModulo(req.usuario.id_usuario);
    return res.status(200).json(resumo);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/progresso/geral
 * Retorna resumo geral do progresso do usuário
 */
router.get("/geral", authmiddleware, async function (req, res) {
  try {
    const progresso = await findProgressoGeral(req.usuario.id_usuario);
    return res.status(200).json(progresso);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/progresso/modulo/:id_modulo
 * Retorna informações de tentativas disponíveis para um módulo específico
 */
router.get("/modulo/:id_modulo", authmiddleware, async function (req, res) {
  try {
    const idModulo = Number(req.params.id_modulo);
    if (!Number.isInteger(idModulo) || idModulo <= 0) {
      return res.status(400).json({ message: "id_modulo inválido" });
    }

    const tentativas = await findTentativasDisponiveisPorModulo(
      req.usuario.id_usuario,
      idModulo
    );

    return res.status(200).json({
      id_modulo: idModulo,
      ...tentativas,
=======
    // Obtém status da média geral
    const mediaGeralStatus = await getMediaGeralStatus(req.usuario.id_usuario);

    return res.status(200).json({
      history,
      mediaGeral: mediaGeralStatus,
>>>>>>> Stashed changes
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

module.exports = router;
