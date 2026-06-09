const {
  iniciarExame,
  obterExameAtivo,
  obterHistoricoExames,
  obterExamePorId,
  obterQuestoesPorModuloEGrupo,
  enviarRespostasExame,
  obterRevisaoExame,
  resetarExames,
} = require("../services/questoes.service");

function shuffleQuestions(questions) {
  return [...questions].sort(() => Math.random() - 0.5);
}

async function iniciarExameController(req, res) {
  try {
    const { id_modulo } = req.body;
    if (!id_modulo) {
      return res.status(400).json({ message: "id_modulo é obrigatório" });
    }

    const result = await iniciarExame(req.usuario.id_usuario, id_modulo);
    return res.status(201).json({ exame: result.exame, questions: shuffleQuestions(result.questions) });
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
}

async function getExameAtivoController(req, res) {
  try {
    const idModulo = Number(req.params.id_modulo);
    if (!Number.isInteger(idModulo) || idModulo <= 0) {
      return res.status(400).json({ message: "id_modulo inválido" });
    }

    const activeExam = await obterExameAtivo(req.usuario.id_usuario, idModulo);
    if (!activeExam) {
      return res.status(404).json({ message: "Nenhum exame ativo para este módulo" });
    }

    return res.status(200).json(activeExam);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
}

async function getHistoricoController(req, res) {
  try {
    const rows = await obterHistoricoExames(req.usuario.id_usuario);

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

    const history = Array.from(modulosMap.values()).map((modulo) => {
      const completedAttempts = modulo.tentativas.filter(
        (t) => Number(t.respostas_respondidas) > 0
      ).length;

      return {
        ...modulo,
        tentativas_restantes: Math.max(2 - completedAttempts, 0),
      };
    });

    return res.status(200).json(history);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
}

async function getExameController(req, res) {
  try {
    const examId = Number(req.params.id);
    const exame = await obterExamePorId(examId);
    if (!exame) {
      return res.status(404).json({ message: "Exame não encontrado" });
    }
    if (exame.id_usuario !== req.usuario.id_usuario) {
      return res.status(403).json({ message: "Acesso negado ao exame" });
    }

    const questions = await obterQuestoesPorModuloEGrupo(exame.id_modulo, exame.grupo);
    return res.status(200).json({ exame, questions });
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
}

async function enviarRespostasController(req, res) {
  try {
    const examId = Number(req.params.id);
    const answers = req.body;
    const exame = await obterExamePorId(examId);
    if (!exame) {
      return res.status(404).json({ message: "Exame não encontrado" });
    }
    if (exame.id_usuario !== req.usuario.id_usuario) {
      return res.status(403).json({ message: "Acesso negado ao exame" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Respostas devem ser informadas como lista" });
    }

    const result = await enviarRespostasExame(exame, answers);
    return res.status(201).json(result);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
}

async function revisarExameController(req, res) {
  try {
    const examId = Number(req.params.id);
    const exame = await obterExamePorId(examId);
    if (!exame) {
      return res.status(404).json({ message: "Exame não encontrado" });
    }
    if (exame.id_usuario !== req.usuario.id_usuario) {
      return res.status(403).json({ message: "Acesso negado ao exame" });
    }

    const rows = await obterRevisaoExame(examId);
    return res.status(200).json({
      exame: {
        id_exame: exame.id_exame,
        id_modulo: exame.id_modulo,
        modulo: exame.modulo,
        grupo: exame.grupo,
        tentativa: exame.tentativa,
      },
      items: rows.map((row) => ({
        id_questao: row.id_questao,
        numero: row.numero,
        dificuldade: row.dificuldade,
        enunciado: row.enunciado,
        alternativa_a: row.alternativa_a,
        alternativa_b: row.alternativa_b,
        alternativa_c: row.alternativa_c,
        alternativa_d: row.alternativa_d,
        alternativa_correta: row.alternativa_correta,
        resposta_usuario: row.resposta,
        nota: row.nota,
        respondido_em: row.respondido_em,
        imagem: row.imagem || null,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
}

async function resetarExamesController(req, res) {
  try {
    await resetarExames(req.usuario.id_usuario);
    return res.status(200).json({ message: "Progresso resetado com sucesso" });
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
}

module.exports = {
  iniciarExameController,
  getExameAtivoController,
  getHistoricoController,
  getExameController,
  enviarRespostasController,
  revisarExameController,
  resetarExamesController,
};
