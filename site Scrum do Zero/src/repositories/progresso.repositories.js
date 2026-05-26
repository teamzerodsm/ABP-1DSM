const pool = require("../database/db");
const MAX_TENTATIVAS = 2;

/**
 * Retorna histórico detalhado de todos os exames de um usuário com cálculo de notas
 */
async function findHistoricoExamesPorUsuario(idUsuario) {
  const result = await pool.query(
    `
    SELECT
      m.id_modulo,
      m.titulo AS modulo,
      e.id_exame,
      e.grupo,
      e.tentativa,
      COUNT(r.id_resposta) AS respostas_respondidas,
      COALESCE(SUM(r.nota), 0) AS nota,
      CASE WHEN e.id_exame IS NOT NULL THEN (
        SELECT COUNT(*)
        FROM questoes
        WHERE id_modulo = e.id_modulo
          AND grupo IS NOT DISTINCT FROM e.grupo
      ) ELSE 0 END AS total_questoes,
      MAX(r.respondido_em) AS data_exame
    FROM modulos m
    LEFT JOIN exames e ON e.id_modulo = m.id_modulo AND e.id_usuario = $1
    LEFT JOIN respostas r ON r.id_exame = e.id_exame
    GROUP BY m.id_modulo, m.titulo, e.id_exame, e.grupo, e.tentativa
    ORDER BY m.id_modulo ASC, e.tentativa ASC
    `,
    [idUsuario]
  );

  return result.rows;
}

/**
 * Retorna resumo consolidado por módulo (melhor nota, tentativas, status)
 */
async function findResumoProgressoPorModulo(idUsuario) {
  const result = await pool.query(
    `
    WITH exam_scores AS (
      SELECT
        e.id_exame,
        e.id_modulo,
        e.id_usuario,
        e.tentativa,
        COALESCE(SUM(r.nota), 0) AS score,
        MAX(r.respondido_em) AS data_ultima_tentativa
      FROM exames e
      LEFT JOIN respostas r ON r.id_exame = e.id_exame
      WHERE e.id_usuario = $1
      GROUP BY e.id_exame, e.id_modulo, e.id_usuario, e.tentativa
    )
    SELECT
      m.id_modulo,
      m.titulo AS modulo,
      COUNT(ex.id_exame) AS total_tentativas,
      GREATEST($2 - COUNT(ex.id_exame), 0) AS tentativas_restantes,
      COALESCE(MAX(ex.score), 0) AS melhor_nota,
      COALESCE(ROUND(AVG(ex.score)::NUMERIC, 2), 0) AS nota_media,
      COALESCE(MAX(ex.tentativa), 0) AS ultima_tentativa,
      MAX(ex.data_ultima_tentativa) AS data_ultima_tentativa,
      CASE
        WHEN COUNT(ex.id_exame) >= 1 AND COALESCE(MAX(ex.score), 0) >= 7 THEN 'Aprovado'
        WHEN COUNT(ex.id_exame) >= 1 THEN 'Reprovado'
        ELSE 'Não iniciado'
      END AS status
    FROM modulos m
    LEFT JOIN exam_scores ex ON ex.id_modulo = m.id_modulo
    GROUP BY m.id_modulo, m.titulo
    ORDER BY m.id_modulo ASC
    `,
    [idUsuario, MAX_TENTATIVAS]
  );

  return result.rows;
}

/**
 * Retorna resumo geral do progresso do usuário
 */
async function findProgressoGeral(idUsuario) {
  const result = await pool.query(
    `
    WITH exam_scores AS (
      SELECT
        e.id_exame,
        e.id_modulo,
        e.id_usuario,
        COALESCE(SUM(r.nota), 0) AS score,
        MAX(r.respondido_em) AS data_ultima_tentativa
      FROM exames e
      LEFT JOIN respostas r ON r.id_exame = e.id_exame
      WHERE e.id_usuario = $1
      GROUP BY e.id_exame, e.id_modulo, e.id_usuario
    )
    SELECT
      COUNT(DISTINCT id_modulo) AS modulos_iniciados,
      COUNT(DISTINCT CASE WHEN score >= 7 THEN id_modulo END) AS modulos_aprovados,
      COUNT(id_exame) AS total_tentativas,
      COUNT(CASE WHEN score IS NOT NULL THEN id_exame END) AS exames_respondidos,
      COALESCE(ROUND(AVG(score)::NUMERIC, 2), 0) AS media_geral,
      MAX(data_ultima_tentativa) AS ultima_atividade
    FROM exam_scores
    `,
    [idUsuario]
  );

  return result.rows[0] || {
    modulos_iniciados: 0,
    modulos_aprovados: 0,
    total_tentativas: 0,
    exames_respondidos: 0,
    media_geral: 0,
    ultima_atividade: null,
  };
}

/**
 * Retorna se ainda há tentativas disponíveis para um módulo específico
 */
async function findTentativasDisponiveisPorModulo(idUsuario, idModulo) {
  const result = await pool.query(
    `
    WITH exam_scores AS (
      SELECT
        e.id_exame,
        COALESCE(SUM(r.nota), 0) AS score
      FROM exames e
      LEFT JOIN respostas r ON r.id_exame = e.id_exame
      WHERE e.id_usuario = $1 AND e.id_modulo = $2
      GROUP BY e.id_exame
    )
    SELECT
      COUNT(id_exame) AS tentativas_usadas,
      GREATEST($3 - COUNT(id_exame), 0) AS tentativas_restantes,
      COUNT(id_exame) >= $3 AS limite_atingido,
      COALESCE(MAX(score), 0) AS melhor_nota
    FROM exam_scores
    `,
    [idUsuario, idModulo, MAX_TENTATIVAS]
  );

  return result.rows[0] || {
    tentativas_usadas: 0,
    tentativas_restantes: MAX_TENTATIVAS,
    limite_atingido: false,
    melhor_nota: 0,
  };
}

module.exports = {
  findHistoricoExamesPorUsuario,
  findResumoProgressoPorModulo,
  findProgressoGeral,
  findTentativasDisponiveisPorModulo,
};
