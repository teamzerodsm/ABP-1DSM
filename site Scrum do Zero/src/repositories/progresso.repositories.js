const pool = require("../database/db");

async function findHistoricoExamesPorUsuario(idUsuario) {
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
    ORDER BY e.id_modulo ASC, e.tentativa ASC
    `,
    [idUsuario]
  );

const db = require("../db");

async function findHistoricoExamesPorUsuario(idUsuario) {

  const sql = `
    SELECT
      n.id AS id_modulo,
      n.titulo AS modulo,
      p.id AS id_exame,
      p.tentativa,
      p.nota,
      p.data_tentativa,
      COUNT(r.id) AS respostas_respondidas
    FROM progresso p

    JOIN niveis n
      ON n.id = p.nivel_id

    LEFT JOIN respostas r
      ON r.progresso_id = p.id

    WHERE p.usuario_id = ?

    GROUP BY
      p.id,
      n.id

    ORDER BY
      n.id,
      p.tentativa
  `;

  const [rows] = await db.query(sql, [idUsuario]);

  return rows;
}

module.exports = {
  findHistoricoExamesPorUsuario,
};

  return result.rows;
}

module.exports = {
  findHistoricoExamesPorUsuario,
};
