const pool = require("../database/db");

async function findAllModulos() {
  const result = await pool.query(
    `SELECT id_modulo, titulo FROM modulos ORDER BY id_modulo ASC`
  );
  return result.rows;
}

async function findModuloById(idModulo) {
  const result = await pool.query(
    `SELECT id_modulo, titulo FROM modulos WHERE id_modulo = $1`,
    [idModulo]
  );
  return result.rows[0] || null;
}

async function findRandomGrupoByModuloExcludingUsed(idUsuario, idModulo) {
  const result = await pool.query(
    `
    SELECT q.grupo
    FROM questoes q
    WHERE q.id_modulo = $1
      AND q.grupo IS NOT NULL
      AND q.grupo NOT IN (
        SELECT e.grupo
        FROM exames e
        WHERE e.id_usuario = $2
          AND e.id_modulo = $1
          AND e.grupo IS NOT NULL
      )
    GROUP BY q.grupo
    ORDER BY RANDOM()
    LIMIT 1
    `,
    [idModulo, idUsuario]
  );

  if (result.rows[0]) {
    return result.rows[0].grupo;
  }

  const fallback = await pool.query(
    `
    SELECT q.grupo
    FROM questoes q
    WHERE q.id_modulo = $1
      AND q.grupo IS NOT NULL
    GROUP BY q.grupo
    ORDER BY RANDOM()
    LIMIT 1
    `,
    [idModulo]
  );

  return fallback.rows[0]?.grupo || null;
}

async function findNextAttemptNumber(idUsuario, idModulo) {
  const result = await pool.query(
    `
    SELECT COALESCE(MAX(tentativa), 0) + 1 AS next_attempt
    FROM exames
    WHERE id_usuario = $1
      AND id_modulo = $2
    `,
    [idUsuario, idModulo]
  );
  return result.rows[0]?.next_attempt || 1;
}

async function insertExame(idUsuario, idModulo, grupo, tentativa) {
  const result = await pool.query(
    `
    INSERT INTO exames (id_modulo, id_usuario, grupo, tentativa)
    VALUES ($1, $2, $3, $4)
    RETURNING id_exame, id_modulo, id_usuario, grupo, tentativa
    `,
    [idModulo, idUsuario, grupo, tentativa]
  );
  return result.rows[0] || null;
}

async function findExamById(idExame) {
  const result = await pool.query(
    `
    SELECT e.id_exame, e.id_usuario, e.id_modulo, e.grupo, e.tentativa,
           m.titulo AS modulo
    FROM exames e
    INNER JOIN modulos m ON m.id_modulo = e.id_modulo
    WHERE e.id_exame = $1
    `,
    [idExame]
  );
  return result.rows[0] || null;
}

async function findQuestionsByModuloAndGrupo(idModulo, grupo) {
  const result = await pool.query(
    `
    SELECT id_questao, id_modulo, grupo, numero, dificuldade, enunciado,
           alternativa_a, alternativa_b, alternativa_c, alternativa_d, imagem
    FROM questoes
    WHERE id_modulo = $1
      AND grupo IS NOT DISTINCT FROM $2
    ORDER BY numero ASC, id_questao ASC
    `,
    [idModulo, grupo]
  );
  return result.rows;
}

async function findExamHistoryByUsuario(idUsuario) {
  const result = await pool.query(
    `
    SELECT
      e.id_exame,
      e.id_modulo,
      m.titulo AS modulo,
      e.grupo,
      e.tentativa,
      COUNT(r.id_resposta) AS respostas_respondidas,
      COALESCE(SUM(r.nota), 0) AS nota
    FROM exames e
    INNER JOIN modulos m ON m.id_modulo = e.id_modulo
    LEFT JOIN respostas r ON r.id_exame = e.id_exame
    WHERE e.id_usuario = $1
    GROUP BY e.id_exame, e.id_modulo, m.titulo, e.grupo, e.tentativa
    ORDER BY e.id_exame DESC
    `,
    [idUsuario]
  );
  return result.rows;
}

async function findExamReviewById(idExame) {
  const result = await pool.query(
    `
    SELECT
      e.id_exame,
      e.id_modulo,
      m.titulo AS modulo,
      e.grupo,
      e.tentativa,
      q.id_questao,
      q.numero,
      q.dificuldade,
      q.enunciado,
      q.alternativa_a,
      q.alternativa_b,
      q.alternativa_c,
      q.alternativa_d,
      q.alternativa_correta,
      r.resposta,
      r.nota,
      r.respondido_em
    FROM exames e
    INNER JOIN modulos m ON m.id_modulo = e.id_modulo
    INNER JOIN questoes q ON q.id_modulo = e.id_modulo
      AND q.grupo IS NOT DISTINCT FROM e.grupo
    LEFT JOIN respostas r ON r.id_exame = e.id_exame
      AND q.id_questao = r.id_questao
    WHERE e.id_exame = $1
    ORDER BY q.numero ASC, q.id_questao ASC
    `,
    [idExame]
  );
  return result.rows;
}

async function findExistingResponses(idExame) {
  const result = await pool.query(
    `
    SELECT id_resposta, id_exame, id_questao, resposta, nota
    FROM respostas
    WHERE id_exame = $1
    `,
    [idExame]
  );
  return result.rows;
}

async function insertResponses(client, answers) {
  const values = [];
  const placeholders = answers
    .map((answer, index) => {
      const idx = 1 + index * 4;
      values.push(answer.id_exame, answer.id_questao, answer.nota, answer.resposta);
      return `($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3})`;
    })
    .join(",\n");

  const result = await client.query(
    `
    INSERT INTO respostas (id_exame, id_questao, nota, resposta)
    VALUES ${placeholders}
    RETURNING id_resposta, id_exame, id_questao, nota, resposta
    `,
    values
  );

  return result.rows;
}

module.exports = {
  findAllModulos,
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
};
