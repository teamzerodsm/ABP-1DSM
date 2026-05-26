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

<<<<<<< Updated upstream
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
      GREATEST(2 - COUNT(ex.id_exame), 0) AS tentativas_restantes,
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
      GREATEST(2 - COUNT(id_exame), 0) AS tentativas_restantes,
      COUNT(id_exame) >= 2 AS limite_atingido,
      COALESCE(MAX(score), 0) AS melhor_nota
    FROM exam_scores
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
=======
async function getMediaGeralStatus(idUsuario) {
  try {
    // Verifica quantos módulos foram concluídos
    const modulosResult = await pool.query(
      `
      SELECT COUNT(DISTINCT e.id_modulo) as modulos_concluidos
      FROM exames e
      WHERE e.id_usuario = $1
        AND EXISTS (
          SELECT 1 FROM respostas r WHERE r.id_exame = e.id_exame
        )
      `,
      [idUsuario]
    );

    const modulosConcluidos = modulosResult.rows[0]?.modulos_concluidos || 0;
    const totalModulos = 5; // Total de 5 níveis

    // Se todos os 5 módulos foram concluídos, calcula a média geral
    if (modulosConcluidos === totalModulos) {
      const mediaResult = await pool.query(
        `
        WITH melhor_nota_por_modulo AS (
          SELECT 
            e.id_modulo,
            MAX(COALESCE(SUM(r.nota), 0)::float / NULLIF(COUNT(r.id_resposta), 0)::float * 10) as nota_modulo
          FROM exames e
          LEFT JOIN respostas r ON r.id_exame = e.id_exame
          WHERE e.id_usuario = $1
            AND EXISTS (
              SELECT 1 FROM respostas r2 WHERE r2.id_exame = e.id_exame
            )
          GROUP BY e.id_exame, e.id_modulo
        )
        SELECT ROUND(AVG(nota_modulo)::numeric, 1) as media_geral
        FROM melhor_nota_por_modulo
        `,
        [idUsuario]
      );

      if (mediaResult.rows.length > 0 && mediaResult.rows[0].media_geral) {
        const media = parseFloat(mediaResult.rows[0].media_geral);
        return {
          status: "completo",
          mediaGeral: media,
          modulosConcluidos,
          totalModulos,
        };
      }
    }

    // Se não completou todos, retorna pendente
    return {
      status: "pendente",
      mediaGeral: null,
      modulosConcluidos,
      totalModulos,
    };
  } catch (error) {
    console.error('Erro ao calcular média geral:', error);
    return {
      status: "pendente",
      mediaGeral: null,
      modulosConcluidos: 0,
      totalModulos: 5,
    };
  }
}

module.exports = {
  findExamHistoryByUsuario,
  getMediaGeralStatus,
>>>>>>> Stashed changes
};
