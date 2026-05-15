const pool = require("../database/db");
const {
  findModuloById,
  findRandomGrupoByModuloExcludingUsed,
  findNextAttemptNumber,
  insertExame,
  findExamById,
  findQuestionsByModuloAndGrupo,
  findExamHistoryByUsuario,
  findExamReviewById,
  findExistingResponses,
  insertResponses,
  findAllModulos,
} = require("../repositories/exames.repositories");

function shuffleQuestions(questions) {
  return [...questions].sort(() => Math.random() - 0.5);
}

async function startExam(idUsuario, idModulo) {
  const modulo = await findModuloById(idModulo);
  if (!modulo) {
    const error = new Error("Módulo não encontrado");
    error.status = 404;
    throw error;
  }

  const nextAttempt = await findNextAttemptNumber(idUsuario, idModulo);
  if (nextAttempt > 2) {
    const error = new Error("Limite de 2 tentativas por módulo atingido");
    error.status = 409;
    throw error;
  }

  const grupo = await findRandomGrupoByModuloExcludingUsed(idUsuario, idModulo);
  if (!grupo) {
    const error = new Error("Nenhum grupo disponível para este módulo");
    error.status = 409;
    throw error;
  }

  const exame = await insertExame(idUsuario, idModulo, grupo, nextAttempt);
  const questions = await findQuestionsByModuloAndGrupo(idModulo, grupo);

  return {
    exame,
    questions: shuffleQuestions(questions),
  };
}

async function getExam(idUsuario, idExame) {
  const exame = await findExamById(idExame);
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

  const questions = await findQuestionsByModuloAndGrupo(exame.id_modulo, exame.grupo);
  return {
    exame,
    questions,
  };
}

async function submitExamResponses(idUsuario, idExame, answers) {
  const exame = await findExamById(idExame);
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

  const existingResponses = await findExistingResponses(idExame);
  if (existingResponses.length > 0) {
    const error = new Error("Respostas já foram enviadas para este exame");
    error.status = 409;
    throw error;
  }

  const questions = await findQuestionsByModuloAndGrupo(exame.id_modulo, exame.grupo);
  const questionMap = new Map(questions.map((q) => [q.id_questao, q]));

  if (!Array.isArray(answers) || answers.length === 0) {
    const error = new Error("Respostas devem ser informadas como lista");
    error.status = 400;
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = await insertResponses(client, prepared);
    await client.query("COMMIT");

    const score = inserted.reduce((sum, item) => sum + Number(item.nota || 0), 0);
    return {
      id_exame: idExame,
      total: inserted.length,
      score,
      respostas: inserted,
    };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function listUserExams(idUsuario) {
  const rows = await findExamHistoryByUsuario(idUsuario);

  // Agrupar por módulo
  const modulosMap = new Map();

  rows.forEach(row => {
    if (!modulosMap.has(row.id_modulo)) {
      modulosMap.set(row.id_modulo, {
        id_modulo: row.id_modulo,
        modulo: row.modulo,
        tentativas: [],
        max_tentativas: 2
      });
    }
    modulosMap.get(row.id_modulo).tentativas.push({
      id_exame: row.id_exame,
      grupo: row.grupo,
      tentativa: row.tentativa,
      respostas_respondidas: row.respostas_respondidas,
      nota: row.nota
    });
  });

  // Calcular tentativas restantes
  const result = Array.from(modulosMap.values()).map(modulo => ({
    ...modulo,
    tentativas_restantes: modulo.max_tentativas - modulo.tentativas.length
  }));

  return result;
}

async function reviewExam(idUsuario, idExame) {
  const exame = await findExamById(idExame);
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

  const rows = await findExamReviewById(idExame);
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

module.exports = {
  startExam,
  getExam,
  submitExamResponses,
  listUserExams,
  reviewExam,
  findAllModulos,
};
