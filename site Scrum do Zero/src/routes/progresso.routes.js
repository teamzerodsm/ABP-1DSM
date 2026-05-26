const { Router } = require("express");
const authmiddleware = require("../middlewares/auth.middleware");
const { findExamHistoryByUsuario } = require("../repositories/progresso.repositories");

const router = Router();

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
      modulosMap.get(row.id_modulo).tentativas.push({
        id_exame: row.id_exame,
        grupo: row.grupo,
        tentativa: row.tentativa,
        respostas_respondidas: Number(row.respostas_respondidas) || 0,
        nota: Number(row.nota) || 0,
        respondido_em: row.respondido_em,
      });
    });

    const history = Array.from(modulosMap.values()).map((modulo) => ({
      ...modulo,
      tentativas_restantes: modulo.max_tentativas - modulo.tentativas.length,
    }));

    return res.status(200).json(history);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

router.get("/historico", authmiddleware, obterProgresso);
router.get("/tentativas", authmiddleware, obterProgresso);

module.exports = router;
