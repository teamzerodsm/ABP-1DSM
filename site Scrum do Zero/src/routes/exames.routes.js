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

5. VER HISTÓRICO DE EXAMES
curl -X GET http://localhost:3000/api/exames/historico \
  -H "Authorization: Bearer SEU_TOKEN"

6. REVISAR EXAME (VER RESPOSTAS CORRETAS)
curl -X GET http://localhost:3000/api/exames/ID_EXAME/revisao \
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
  findRandomGrupoByModuloExcludingUsed,
  findNextAttemptNumber,
  findActiveExamByUsuarioModulo,
  insertExame,
  findExamById,
  findQuestionsByModuloAndGrupo,
  findExamHistoryByUsuario,
  findExamReviewById,
  findExistingResponses,
  insertResponses,
} = require("../repositories/exames.repositories");

const router = Router();
const MAX_TENTATIVAS = 2;

function shuffleQuestions(questions) {
  return [...questions].sort(() => Math.random() - 0.5);
}

router.post("/", authmiddleware, async function (req, res) {
  try {
    const { id_modulo } = req.body;
    if (!id_modulo) {
      return res.status(400).json({ message: "id_modulo é obrigatório" });
    }

    const modulo = await findModuloById(id_modulo);
    if (!modulo) {
      return res.status(404).json({ message: "Módulo não encontrado" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `SELECT 1 FROM exames WHERE id_usuario = $1 AND id_modulo = $2 FOR UPDATE`,
        [req.usuario.id_usuario, id_modulo]
      );

      const activeExam = await findActiveExamByUsuarioModulo(client, req.usuario.id_usuario, id_modulo);
      if (activeExam) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: "Você já possui uma tentativa em andamento neste módulo" });
      }

      const nextAttempt = await findNextAttemptNumber(client, req.usuario.id_usuario, id_modulo);
      if (nextAttempt > 2) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: "Limite de 2 tentativas por módulo atingido" });
      }

      const grupo = await findRandomGrupoByModuloExcludingUsed(client, req.usuario.id_usuario, id_modulo);
      if (!grupo) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: "Nenhum grupo disponível para este módulo" });
      }

      const exame = await insertExame(client, req.usuario.id_usuario, id_modulo, grupo, nextAttempt);
      const questions = await findQuestionsByModuloAndGrupo(id_modulo, grupo);

      await client.query("COMMIT");

      return res.status(201).json({ exame, questions: shuffleQuestions(questions) });
    } catch (innerError) {
      await client.query("ROLLBACK");
      throw innerError;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

router.get("/ativo/:id_modulo", authmiddleware, async function (req, res) {
  try {
    const idModulo = Number(req.params.id_modulo);
    if (!Number.isInteger(idModulo) || idModulo <= 0) {
      return res.status(400).json({ message: "id_modulo inválido" });
    }

    const activeExam = await findActiveExamByUsuarioModulo(pool, req.usuario.id_usuario, idModulo);
    if (!activeExam) {
      return res.status(404).json({ message: "Nenhum exame ativo para este módulo" });
    }

    return res.status(200).json(activeExam);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/historico", authmiddleware, async function (req, res) {
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
        });
      }
    });

    const history = Array.from(modulosMap.values()).map((modulo) => ({
      ...modulo,
      tentativas_restantes: Math.max(MAX_TENTATIVAS - modulo.tentativas.length, 0),
    }));

    return res.status(200).json(history);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/:id", authmiddleware, async function (req, res) {
  try {
    const examId = Number(req.params.id);
    const exame = await findExamById(examId);
    if (!exame) {
      return res.status(404).json({ message: "Exame não encontrado" });
    }
    if (exame.id_usuario !== req.usuario.id_usuario) {
      return res.status(403).json({ message: "Acesso negado ao exame" });
    }

    const questions = await findQuestionsByModuloAndGrupo(exame.id_modulo, exame.grupo);
    return res.status(200).json({ exame, questions });
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

router.post("/:id/respostas", authmiddleware, async function (req, res) {
  try {
    const examId = Number(req.params.id);
    const answers = req.body;
    const exame = await findExamById(examId);
    if (!exame) {
      return res.status(404).json({ message: "Exame não encontrado" });
    }
    if (exame.id_usuario !== req.usuario.id_usuario) {
      return res.status(403).json({ message: "Acesso negado ao exame" });
    }

    const questions = await findQuestionsByModuloAndGrupo(exame.id_modulo, exame.grupo);
    const questionMap = new Map(questions.map((q) => [q.id_questao, q]));

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Respostas devem ser informadas como lista" });
    }

    if (answers.length !== questions.length) {
      return res.status(400).json({ message: "Todas as questões do grupo devem ser respondidas" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`SELECT 1 FROM exames WHERE id_exame = $1 FOR UPDATE`, [examId]);

      const existingResponses = await findExistingResponses(examId);
      if (existingResponses.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: "Respostas já foram enviadas para este exame" });
      }

      const prepared = answers.map((answer) => {
        const question = questionMap.get(answer.id_questao);
        if (!question) {
          throw new Error(`Questão inválida: ${answer.id_questao}`);
        }
        const normalized = String(answer.resposta || "").trim().toLowerCase();
        const nota = question.alternativa_correta === normalized ? 1 : 0;
        return {
          id_exame: examId,
          id_questao: answer.id_questao,
          resposta: normalized,
          nota,
        };
      });

      const inserted = await insertResponses(client, prepared);
      await client.query("COMMIT");

      const score = inserted.reduce((sum, item) => sum + Number(item.nota || 0), 0);
      const errors = inserted.length - score;
      return res.status(201).json({ id_exame: examId, total: inserted.length, score, errors, respostas: inserted });
    } catch (innerError) {
      await client.query("ROLLBACK");
      throw innerError;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

router.get("/:id/revisao", authmiddleware, async function (req, res) {
  try {
    const examId = Number(req.params.id);
    const exame = await findExamById(examId);
    if (!exame) {
      return res.status(404).json({ message: "Exame não encontrado" });
    }
    if (exame.id_usuario !== req.usuario.id_usuario) {
      return res.status(403).json({ message: "Acesso negado ao exame" });
    }

    const rows = await findExamReviewById(examId);
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
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

module.exports = router;
