/*
PASSO A PASSO PARA TESTAR O SISTEMA DE EXAMES (PROVA FECHADA)

1. CRIAR USUÁRIO
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@email.com","cpf":"12345678901","senha":"123456"}'

2. FAZER LOGIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901", "senha":"123456"}'
# Copie o token retornado

3. INICIAR EXAME NO MÓDULO 2
curl -X POST http://localhost:3000/api/exames \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"id_modulo": 2}'
# Copie o id_exame e as id_questao das questões retornadas

4. RESPONDER TODAS AS QUESTÕES
curl -X POST http://localhost:3000/api/exames/ID_EXAME/respostas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '[
    {"id_questao": 11, "resposta": "a"},
    {"id_questao": 12, "resposta": "b"},
    {"id_questao": 13, "resposta": "c"},
    {"id_questao": 14, "resposta": "d"},
    {"id_questao": 15, "resposta": "a"},
    {"id_questao": 16, "resposta": "b"},
    {"id_questao": 17, "resposta": "c"},
    {"id_questao": 18, "resposta": "d"},
    {"id_questao": 19, "resposta": "a"},
    {"id_questao": 20, "resposta": "b"}
  ]'

5. curl -X GET http://localhost:3000/api/progresso/tentativas \
  -H "Authorization: Bearer SEU_TOKEN"

6. curl -X GET http://localhost:3000/api/exames/ID_EXAME/resultado \
  -H "Authorization: Bearer SEU_TOKEN"

NOTAS:
- Máximo 2 tentativas por módulo
- Histórico mostra tentativas restantes por módulo
- Questões são embaralhadas aleatoriamente
- Sistema impede mais de 2 tentativas no mesmo módulo
*/

const { Router } = require("express");
const authmiddleware = require("../middlewares/auth.middleware");
const pool = require("../database/db");
const {
  findModuloById,
  findGrupoAleatorioPorModuloExcluindoUsado,
  findNumeroProximaTentativa,
  findExameAtivoPorUsuarioEModulo,
  insertExame,
  findExameById,
  findQuestoesPorModuloEGrupo,
  findRevisaoExameById,
  findRespostasExistentes,
  insertRespostas,
  findHistoricoExamesPorUsuario,
} = require("../repositories/exames.repositories");

const router = Router();

function embaralharQuestoes(questions) {
  return [...questions].sort(() => Math.random() - 0.5);
}

async function iniciarExame(idUsuario, idModulo) {
  const modulo = await findModuloById(idModulo);
  if (!modulo) {
    const error = new Error("Módulo não encontrado");
    error.status = 404;
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `
      SELECT 1
      FROM exames
      WHERE id_usuario = $1
        AND id_modulo = $2
      FOR UPDATE
      `,
      [idUsuario, idModulo]
    );

    const activeExam = await findExameAtivoPorUsuarioEModulo(client, idUsuario, idModulo);
    if (activeExam) {
      const error = new Error("Você já possui uma tentativa em andamento neste módulo");
      error.status = 409;
      throw error;
    }

    const nextAttempt = await findNumeroProximaTentativa(client, idUsuario, idModulo);
    if (nextAttempt > 2) {
      const error = new Error("Limite de 2 tentativas por módulo atingido");
      error.status = 409;
      throw error;
    }

    const grupo = await findGrupoAleatorioPorModuloExcluindoUsado(client, idUsuario, idModulo);
    if (!grupo) {
      const error = new Error("Nenhum grupo disponível para este módulo");
      error.status = 409;
      throw error;
    }

    const exame = await insertExame(client, idUsuario, idModulo, grupo, nextAttempt);
    const questions = await findQuestoesPorModuloEGrupo(idModulo, grupo);

    await client.query("COMMIT");

    return {
      exame,
      questions: embaralharQuestoes(questions),
    };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function obterExame(idUsuario, idExame) {
  const exame = await findExameById(idExame);
  if (!exame) {
    const error = new Error("Exame não encontrado");
    error.status = 404;
    throw error;
  }
  if (exame.id_usuario !== idUsuario) {
    const error = new Error("Acesso negado ao exame");
    error.status = 403;
    throw error;
  }

  const questions = await findQuestoesPorModuloEGrupo(exame.id_modulo, exame.grupo);
  return {
    exame,
    questions,
  };
}

async function enviarRespostasExame(idUsuario, idExame, answers) {
  const exame = await findExameById(idExame);
  if (!exame) {
    const error = new Error("Exame não encontrado");
    error.status = 404;
    throw error;
  }
  if (exame.id_usuario !== idUsuario) {
    const error = new Error("Acesso negado ao exame");
    error.status = 403;
    throw error;
  }

  const questions = await findQuestoesPorModuloEGrupo(exame.id_modulo, exame.grupo);
  const questionMap = new Map(questions.map((q) => [q.id_questao, q]));

  if (!Array.isArray(answers) || answers.length === 0) {
    const error = new Error("Respostas devem ser informadas como lista");
    error.status = 400;
    throw error;
  }

  if (answers.length !== questions.length) {
    const error = new Error("Todas as questões do grupo devem ser respondidas");
    error.status = 400;
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `SELECT 1 FROM exames WHERE id_exame = $1 FOR UPDATE`,
      [idExame]
    );

    const existingResponses = await findRespostasExistentes(idExame);
    if (existingResponses.length > 0) {
      const error = new Error("Respostas já foram enviadas para este exame");
      error.status = 409;
      throw error;
    }

    const prepared = answers.map((answer) => {
      const question = questionMap.get(answer.id_questao);
      if (!question) {
        const error = new Error(`Questão inválida: ${answer.id_questao}`);
        error.status = 400;
        throw error;
      }

      const normalized = String(answer.resposta || "").trim().toLowerCase();
      const nota = question.alternativa_correta === normalized ? 1 : 0;
      return {
        id_exame: idExame,
        id_questao: answer.id_questao,
        resposta: normalized,
        nota,
      };
    });

    const inserted = await insertRespostas(client, prepared);
    await client.query("COMMIT");

    const score = inserted.reduce((sum, item) => sum + Number(item.nota || 0), 0);
    const errors = inserted.length - score;

    return {
      id_exame: idExame,
      total: inserted.length,
      score,
      errors,
      respostas: inserted,
    };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function obterHistoricoExames(idUsuario) {
  const rows = await findHistoricoExamesPorUsuario(idUsuario);

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
    });
  });

  return Array.from(modulosMap.values()).map((modulo) => ({
    ...modulo,
    tentativas_restantes: modulo.max_tentativas - modulo.tentativas.length,
  }));
}

async function revisarExame(idUsuario, idExame) {
  const exame = await findExameById(idExame);
  if (!exame) {
    const error = new Error("Exame não encontrado");
    error.status = 404;
    throw error;
  }
  if (exame.id_usuario !== idUsuario) {
    const error = new Error("Acesso negado ao exame");
    error.status = 403;
    throw error;
  }

  const rows = await findRevisaoExameById(idExame);
  return {
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
    })),
  };
}

router.post("/", authmiddleware, async function (req, res) {
  try {
    const { id_modulo } = req.body;
    if (!id_modulo) {
      return res.status(400).json({ message: "id_modulo é obrigatório" });
    }

    const result = await iniciarExame(req.usuario.id_usuario, id_modulo);
    return res.status(201).json(result);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

router.get("/historico", authmiddleware, async function (req, res) {
  try {
    const history = await obterHistoricoExames(req.usuario.id_usuario);
    return res.status(200).json(history);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/:id", authmiddleware, async function (req, res) {
  try {
    const examId = Number(req.params.id);
    const result = await obterExame(req.usuario.id_usuario, examId);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

router.post("/:id/respostas", authmiddleware, async function (req, res) {
  try {
    const examId = Number(req.params.id);
    const answers = req.body;
    const result = await enviarRespostasExame(req.usuario.id_usuario, examId, answers);
    return res.status(201).json(result);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

router.get("/:id/resultado", authmiddleware, async function (req, res) {
  try {
    const examId = Number(req.params.id);
    const result = await revisarExame(req.usuario.id_usuario, examId);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

module.exports = router;
