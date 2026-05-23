const pool = require("../database/db");

/**
 * Retorna histórico detalhado de todos os exames de um usuário com cálculo de notas
 */
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
      COALESCE(SUM(r.nota), 0) AS nota,
      (SELECT COUNT(*) FROM questoes WHERE id_modulo = e.id_modulo AND grupo IS NOT DISTINCT FROM e.grupo) AS total_questoes,
      MAX(r.respondido_em) AS data_exame
    FROM exames e
    INNER JOIN modulos m ON m.id_modulo = e.id_modulo
    LEFT JOIN respostas r ON r.id_exame = e.id_exame
    WHERE e.id_usuario = $1
    GROUP BY e.id_exame, e.id_modulo, m.titulo, e.grupo, e.tentativa
    ORDER BY e.id_modulo ASC, e.tentativa ASC
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
    SELECT
      m.id_modulo,
      m.titulo AS modulo,
      COUNT(e.id_exame) AS total_tentativas,
      GREATEST(2 - COUNT(e.id_exame), 0) AS tentativas_restantes,
      MAX(COALESCE(SUM(r.nota), 0)) AS melhor_nota,
      AVG(COALESCE(SUM(r.nota), 0))::NUMERIC(5,2) AS nota_media,
      MAX(e.tentativa) AS ultima_tentativa,
      MAX(e.criado_em) AS data_ultima_tentativa,
      CASE 
        WHEN COUNT(e.id_exame) >= 1 AND MAX(COALESCE(SUM(r.nota), 0)) >= 7 THEN 'Aprovado'
        WHEN COUNT(e.id_exame) >= 1 THEN 'Reprovado'
        ELSE 'Não iniciado'
      END AS status
    FROM modulos m
    LEFT JOIN exames e ON e.id_modulo = m.id_modulo AND e.id_usuario = $1
    LEFT JOIN respostas r ON r.id_exame = e.id_exame
    GROUP BY m.id_modulo, m.titulo
    ORDER BY m.id_modulo ASC
    `,
    [idUsuario]
  );

  return result.rows;
}

/**
 * Retorna resumo geral do progresso do usuário
 */
async function findProgressoGeral(idUsuario) {
  const result = await pool.query(
    `
    SELECT
      COUNT(DISTINCT e.id_modulo) AS modulos_iniciados,
      COUNT(DISTINCT CASE WHEN MAX(r.nota) >= 7 THEN e.id_modulo END) AS modulos_aprovados,
      COUNT(e.id_exame) AS total_tentativas,
      COUNT(DISTINCT CASE WHEN COUNT(r.id_resposta) > 0 THEN e.id_exame END) AS exames_respondidos,
      ROUND(AVG(COALESCE(SUM(r.nota), 0))::NUMERIC, 2) AS media_geral,
      MAX(e.criado_em) AS ultima_atividade
    FROM exames e
    LEFT JOIN respostas r ON r.id_exame = e.id_exame
    WHERE e.id_usuario = $1
    GROUP BY e.id_usuario
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
    SELECT
      COUNT(e.id_exame) AS tentativas_usadas,
      GREATEST(2 - COUNT(e.id_exame), 0) AS tentativas_restantes,
      CASE WHEN COUNT(e.id_exame) >= 2 THEN true ELSE false END AS limite_atingido,
      MAX(COALESCE(SUM(r.nota), 0)) AS melhor_nota
    FROM exames e
    LEFT JOIN respostas r ON r.id_exame = e.id_exame
    WHERE e.id_usuario = $1 AND e.id_modulo = $2
    GROUP BY e.id_modulo
    `,
    [idUsuario, idModulo]
  );

  return result.rows[0] || {
    tentativas_usadas: 0,
    tentativas_restantes: 2,
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
