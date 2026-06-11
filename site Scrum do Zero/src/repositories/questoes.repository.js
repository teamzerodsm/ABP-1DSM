const pool = require("../database/db");

async function findModulosRespondidosByUsuario(idUsuario) {
  const result = await pool.query(
    `
    SELECT
      e.id_exame,
      e.id_modulo,
      e.tentativa,
      COUNT(r.id_resposta) AS questoes_respondidas,
      COALESCE(SUM(r.nota), 0) AS nota,
      COUNT(DISTINCT q2.id_questao) AS questoes,
      MIN(r.respondido_em) AS inicio,
      MAX(r.respondido_em) AS fim
    FROM exames e
    LEFT JOIN respostas r ON r.id_exame = e.id_exame
    LEFT JOIN questoes q2 ON q2.id_modulo = e.id_modulo
      AND q2.grupo IS NOT DISTINCT FROM e.grupo
    WHERE e.id_usuario = $1
    GROUP BY e.id_exame, e.id_modulo, e.tentativa
    ORDER BY e.id_modulo ASC, e.tentativa ASC
    `,
    [idUsuario]
  );

  return result.rows;
}

module.exports = {
  findModulosRespondidosByUsuario,
};
