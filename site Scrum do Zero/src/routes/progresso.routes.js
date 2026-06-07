const { Router } = require("express");
const authmiddleware = require("../middlewares/auth.middleware");
const { findExamHistoryByUsuario } = require("../repositories/progresso.repository");

const router = Router();
const MAX_TENTATIVAS = 2;

async function obterProgresso(req, res) {
  try {
    const rows = await findExamHistoryByUsuario(req.usuario.id_usuario);

    const modulosMap = new Map();
    rows.forEach((row) => {
      if (!modulosMap.has(row.id_modulo)) {
        modulosMap.set(row.id_modulo, {
          id_modulo: row.id_modulo,
          modulo: row.modulo,
          tentativas: [],
          max_tentativas: 2,
        });
      }

      if (row.id_exame) {
        modulosMap.get(row.id_modulo).tentativas.push({
          id_exame: row.id_exame,
          grupo: row.grupo,
          tentativa: row.tentativa,
          respostas_respondidas: Number(row.respostas_respondidas) || 0,
          nota: Number(row.nota) || 0,
          total_questoes: Number(row.total_questoes) || 0,
          data_exame: row.data_exame,
        });
      }
    });

    const history = Array.from(modulosMap.values()).map((modulo) => {
      const completedAttempts = modulo.tentativas.filter(
        (t) => Number(t.respostas_respondidas) > 0
      ).length;

      return {
        ...modulo,
        tentativas_restantes: Math.max(MAX_TENTATIVAS - completedAttempts, 0),
      };
    });

    return res.status(200).json(history);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

router.get("/historico", authmiddleware, obterProgresso);
router.get("/tentativas", authmiddleware, obterProgresso);

module.exports = router;
