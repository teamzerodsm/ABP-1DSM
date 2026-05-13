import "./components/dialog.js";

const levelBtns = document.querySelectorAll(".level-btn");
const dialogComponent = document.querySelector("dialog-modules");

const dadosDoBanco = [
  { id: 1, level: "Nível 1", titulo: "Fundamentos", descricao: "Descrição aqui...", tentativas: "3", pontos: "100" },
  { id: 2, level: "Scrum: Estrutura, Papéis e Artefatos" },
  { id: 3, level: "Eventos do Scrum e Fluxo de Trabalho" },
  { id: 4, level: "Práticas Ágeis, Métricas e Qualidade" },
  { id: 5, level: "Aplicação Prática, Cenários e Análise Crítica" },
];

levelBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const levelID = btn.dataset.idlevel;
    const info = dadosDoBanco.find((dado) => dado.id == levelID);

    dialogComponent.setDados(info);
    dialogComponent.dialog.showModal();
  });
});