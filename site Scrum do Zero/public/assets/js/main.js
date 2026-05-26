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
  const historico = await res.json();
  console.log("historico completo:", historico);  // <-- adiciona isso

  const modulo = historico.find((m) => m.id_modulo == idModulo);
  console.log("modulo encontrado:", modulo);  // <-- e isso

  const tentativas = modulo?.tentativas_restantes ?? 2;
  const pontos = modulo
    ? Math.max(...modulo.tentativas.map((t) => t.nota), 0)
    : 0;

  return { tentativas, pontos };
}

levelBtns.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const levelID = btn.dataset.idlevel;
    const info = dadosDoBanco.find((dado) => dado.id == levelID);

    const { tentativas, pontos } = await fetchDadosModulo(levelID);

    dialogComponent.setDados({ ...info, idModulo: info.id, tentativas, pontos });
    dialogComponent.dialog.showModal();
  });
});

function atualizarEstadoCertificado() {
  const totalNiveis = 5;
  const wrapperCertificado = document.querySelector(".certificado-wrapper");
  const botaoCertificado = document.getElementById("btnCertificado");

  if (!wrapperCertificado || !botaoCertificado) return;

  const niveisConcluidos = Number(localStorage.getItem("niveisConcluidos")) || 0;

  if (niveisConcluidos >= totalNiveis) {
    wrapperCertificado.classList.remove("bloqueado");
    botaoCertificado.removeAttribute("aria-disabled");
    botaoCertificado.style.pointerEvents = "auto";
    botaoCertificado.style.opacity = "1";
  } else {
    wrapperCertificado.classList.add("bloqueado");
    botaoCertificado.setAttribute("aria-disabled", "true");
    botaoCertificado.style.pointerEvents = "none";
    botaoCertificado.style.opacity = "0.45";
  }
}

document.addEventListener("DOMContentLoaded", atualizarEstadoCertificado);