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
} = require("../repositories/exames.repository");

async function iniciarExame(usuarioId, idModulo) {
  const modulo = await findModuloById(idModulo);
  if (!modulo) {
    throw { status: 404, message: "Módulo não encontrado" };
  }

  if (idModulo > 1) {
    const history = await findExamHistoryByUsuario(usuarioId);
    const prevCompleted = history.some(
      (attempt) =>
        attempt.id_modulo === idModulo - 1 &&
        Number(attempt.respostas_respondidas) > 0
    );
    if (!prevCompleted) {
      throw {
        status: 403,
        message: "Você precisa concluir o nível anterior antes de iniciar este.",
      };
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `SELECT 1 FROM exames WHERE id_usuario = $1 AND id_modulo = $2 FOR UPDATE`,
      [usuarioId, idModulo]
    );

    if (idModulo > 1) {
      const prevModuloId = idModulo - 1;
      const prevAttempt = await client.query(
        `SELECT 1 FROM exames e
         WHERE e.id_usuario = $1 AND e.id_modulo = $2
           AND EXISTS (SELECT 1 FROM respostas r WHERE r.id_exame = e.id_exame)
         LIMIT 1`,
        [usuarioId, prevModuloId]
      );
      if (prevAttempt.rows.length === 0) {
        await client.query("ROLLBACK");
        throw {
          status: 403,
          message: "Você precisa concluir o nível anterior antes de iniciar este nível.",
        };
      }
    }

    const activeExam = await findActiveExamByUsuarioModulo(client, usuarioId, idModulo);
    if (activeExam) {
      await client.query("ROLLBACK");
      throw {
        status: 409,
        message: "Você já possui uma tentativa em andamento neste módulo",
      };
    }

    const nextAttempt = await findNextAttemptNumber(client, usuarioId, idModulo);
    if (nextAttempt > 2) {
      await client.query("ROLLBACK");
      throw { status: 409, message: "Limite de 2 tentativas por módulo atingido" };
    }

    const grupo = await findRandomGrupoByModuloExcludingUsed(client, usuarioId, idModulo);
    if (!grupo) {
      await client.query("ROLLBACK");
      throw {
        status: 409,
        message: "Nenhum grupo disponível para este módulo",
      };
    }

    const exame = await insertExame(client, usuarioId, idModulo, grupo, nextAttempt);
    const questions = await findQuestionsByModuloAndGrupo(idModulo, grupo);

    await client.query("COMMIT");
    return { exame, questions };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function obterExameAtivo(usuarioId, idModulo) {
  return findActiveExamByUsuarioModulo(pool, usuarioId, idModulo);
}

async function obterHistoricoExames(usuarioId) {
  return findExamHistoryByUsuario(usuarioId);
}

async function obterExamePorId(examId) {
  return findExamById(examId);
}

async function obterQuestoesPorModuloEGrupo(idModulo, grupo) {
  return findQuestionsByModuloAndGrupo(idModulo, grupo);
}

async function enviarRespostasExame(exame, answers) {
  const questions = await findQuestionsByModuloAndGrupo(exame.id_modulo, exame.grupo);
  const questionMap = new Map(questions.map((q) => [q.id_questao, q]));

  if (answers.length !== questions.length) {
    throw { status: 400, message: "Todas as questões do grupo devem ser respondidas" };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`SELECT 1 FROM exames WHERE id_exame = $1 FOR UPDATE`, [exame.id_exame]);

    const existingResponses = await findExistingResponses(exame.id_exame);
    if (existingResponses.length > 0) {
      await client.query("ROLLBACK");
      throw {
        status: 409,
        message: "Respostas já foram enviadas para este exame",
      };
    }

    const prepared = answers.map((answer) => {
      const question = questionMap.get(answer.id_questao);
      if (!question) {
        throw new Error(`Questão inválida: ${answer.id_questao}`);
      }
      const normalized = String(answer.resposta || "").trim().toLowerCase();
      const nota = question.alternativa_correta === normalized ? 1 : 0;
      return {
        id_exame: exame.id_exame,
        id_questao: answer.id_questao,
        resposta: normalized,
        nota,
      };
    });

    const inserted = await insertResponses(client, prepared);
    await client.query("COMMIT");

    const score = inserted.reduce((sum, item) => sum + Number(item.nota || 0), 0);
    const errors = inserted.length - score;

    return {
      id_exame: exame.id_exame,
      total: inserted.length,
      score,
      errors,
      respostas: inserted,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function obterRevisaoExame(examId) {
  return findExamReviewById(examId);
}

async function resetarExames(usuarioId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM respostas WHERE id_exame IN (
         SELECT id_exame FROM exames WHERE id_usuario = $1
       )`,
      [usuarioId]
    );

    await client.query(`DELETE FROM exames WHERE id_usuario = $1`, [usuarioId]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  iniciarExame,
  obterExameAtivo,
  obterHistoricoExames,
  obterExamePorId,
  obterQuestoesPorModuloEGrupo,
  enviarRespostasExame,
  obterRevisaoExame,
  resetarExames,
};