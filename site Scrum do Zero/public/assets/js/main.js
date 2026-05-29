import "./components/dialog.js";

const levelBtns = document.querySelectorAll(".level-btn");
const dialogComponent = document.querySelector("dialog-modules");

const dadosDoBanco = [
  { id: 1, level: "Nível 1", titulo: "Fundamentos Das Metodologias Ágeis", descricao: "Introdução ao pensamento ágil, origem do Manifesto Ágil, seus 4 valores e 12 princípios. Comparação entre abordagens tradicionais (Waterfall) e ágeis, e por que o mercado adotou essa mudança de mentalidade." },
  { id: 2, level: "Nível 2", titulo: "Scrum: Estrutura, Papéis e Artefatos", descricao: "Visão geral do framework Scrum e seus três pilares. Responsabilidades do Product Owner, Scrum Master e Time de Desenvolvimento. Entendimento do Product Backlog, Sprint Backlog e Incremento." },
  { id: 3, level: "Nível 3", titulo: "Eventos do Scrum e Fluxo de Trabalho", descricao: "Funcionamento das Sprints e seus quatro eventos: Planning, Daily, Review e Retrospective. Como o trabalho flui do backlog até a entrega, com foco em cadência, transparência e inspeção contínua." },
  { id: 4, level: "Nível 4", titulo: "Práticas Ágeis, Métricas e Qualidade", descricao: "Técnicas de estimativa (Planning Poker, Story Points), uso de burndown e velocity para acompanhar o progresso, e práticas de qualidade como Definition of Done e melhoria contínua." },
  { id: 5, level: "Nível 5", titulo: "Aplicação Prática, Cenários e Análise Crítica", descricao: "Simulações de situações reais, análise de casos onde o Scrum funciona bem ou mal, e visão crítica sobre limitações do ágil. Preparação para aplicar o conhecimento em times e projetos reais." },
];

async function fetchDadosModulo(idModulo) {
  const token = localStorage.getItem("token");
  console.debug("[main] fetchDadosModulo token present:", !!token, "idModulo:", idModulo);
  const res = await fetch("/api/progresso/tentativas", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return { tentativas: 2, pontos: 0 };
  }
  const historico = await res.json();
  console.log("historico completo:", historico);

  const modulo = historico.find((m) => m.id_modulo == idModulo);
  console.log("modulo encontrado:", modulo);

  const tentativas = modulo?.tentativas_restantes ?? 2;
  const pontos = modulo
    ? Math.max(...modulo.tentativas.map((t) => t.nota), 0)
    : 0;

  return { tentativas, pontos };
}

async function atualizarBloqueioNiveis() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("/api/progresso/tentativas", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const historico = await res.json();

    const completedLevels = historico.filter(m => 
      m.tentativas.some(t => Number(t.respostas_respondidas) > 0)
    ).length;

    let sumBest = 0;
    historico.forEach(m => {
      const completedAttempts = m.tentativas.filter(t => Number(t.respostas_respondidas) > 0);
      const best = completedAttempts.length 
        ? Math.max(...completedAttempts.map(t => Number(t.nota))) 
        : 0;
      sumBest += best;
    });
    const average = (sumBest / 5).toFixed(1);

    localStorage.setItem("niveisConcluidos", completedLevels);
    localStorage.setItem("mediaFinal", average);
    window.dispatchEvent(new Event('progressUpdated'));

    levelBtns.forEach((btn) => {
      const levelID = Number(btn.dataset.idlevel);
      if (levelID > 1) {
        const moduloAnterior = historico.find((m) => Number(m.id_modulo) === levelID - 1);
        const concluidoAnterior = moduloAnterior && Array.isArray(moduloAnterior.tentativas)
          ? moduloAnterior.tentativas.some((t) => Number(t.respostas_respondidas) > 0)
          : false;

        if (!concluidoAnterior) {
          btn.classList.add("locked");
          btn.setAttribute("disabled", "true");
        } else {
          btn.classList.remove("locked");
          btn.removeAttribute("disabled");
        }
      }
    });
  } catch (error) {
    console.error("Erro ao verificar bloqueio de níveis:", error);
  }
}

levelBtns.forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (btn.classList.contains("locked") || btn.disabled) {
      return;
    }
    const levelID = btn.dataset.idlevel;
    const info = dadosDoBanco.find((dado) => dado.id == levelID);

    const { tentativas, pontos } = await fetchDadosModulo(levelID);

    dialogComponent.setDados({ ...info, idModulo: info.id, tentativas, pontos });
    dialogComponent.dialog.showModal();
  });
});

// Executa a verificação ao carregar a página
atualizarBloqueioNiveis();
