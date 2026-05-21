const pool = require("../database/db");

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
      AND EXISTS (
        SELECT 1 FROM respostas r2 WHERE r2.id_exame = e.id_exame
      )
    GROUP BY e.id_exame, e.id_modulo, m.titulo, e.grupo, e.tentativa
    ORDER BY e.id_modulo ASC, e.tentativa ASC
    `,
    [idUsuario]
  );

  return result.rows;
}

module.exports = {
  findExamHistoryByUsuario,
};
