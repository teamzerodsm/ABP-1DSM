const { findExamHistoryByUsuario } = require("../repositories/progresso.repository");

async function obterHistoricoProgresso(idUsuario) {
  const rows = await findExamHistoryByUsuario(idUsuario);

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
        total_questoes: Number(row.total_questoes) || 0,
        data_exame: row.data_exame,
      });
    }
  });

  return Array.from(modulosMap.values()).map((modulo) => {
    const completedAttempts = modulo.tentativas.filter(
      (t) => Number(t.respostas_respondidas) > 0
    ).length;

    return {
      ...modulo,
      tentativas_restantes: Math.max(2 - completedAttempts, 0),
    };
  });
}

module.exports = {
  obterHistoricoProgresso,
};
