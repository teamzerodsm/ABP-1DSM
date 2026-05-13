import "./components/dialogNota.js";

/* =========================================
   BANCO DE DADOS FICTÍCIO
========================================= */

const questions = [
  {
    id: 1,

    question:
      "Durante a Daily Scrum, os Desenvolvedores percebem que parte das tarefas planejadas para a Sprint está demandando mais tempo e esforço técnico do que o inicialmente previsto. Além disso, surgiram impedimentos que podem comprometer a entrega do Incremento dentro do prazo estabelecido. Considerando as práticas do Scrum, qual deve ser a ação mais adequada da equipe diante dessa situação?",

    options: {
      A: "Reavaliar o Sprint Backlog em conjunto com o Product Owner para adaptar o escopo da Sprint conforme a realidade atual.",
      B: "Cancelar imediatamente a Sprint e iniciar uma nova sem consultar o restante do Scrum Team.",
      C: "Exigir que todos os Desenvolvedores realizem horas extras obrigatórias até a conclusão das tarefas.",
      D: "Continuar trabalhando normalmente e ignorar os impedimentos até a Sprint Review.",
    },

    correct: "A",
  },

  {
    id: 2,

    question:
      "Dentro do framework Scrum, existe um papel responsável por garantir que o produto entregue gere o maior valor possível para clientes, usuários e stakeholders. Esse profissional também é responsável por priorizar o Product Backlog e tomar decisões relacionadas ao direcionamento do produto. Quem exerce essa responsabilidade?",

    options: {
      A: "Scrum Master",
      B: "Desenvolvedores",
      C: "Product Owner",
      D: "Stakeholders",
    },

    correct: "C",
  },

  {
    id: 3,

    question:
      "Ao final de cada Sprint, o Scrum Team realiza um evento oficial para apresentar o trabalho concluído, coletar feedback e discutir possíveis adaptações futuras no produto e no planejamento. Qual é o principal objetivo desse evento dentro do Scrum?",

    options: {
      A: "Planejar detalhadamente todas as atividades da próxima Sprint.",
      B: "Apresentar o Incremento desenvolvido aos stakeholders e obter feedback sobre o produto.",
      C: "Avaliar individualmente o desempenho de cada Desenvolvedor durante a Sprint.",
      D: "Corrigir exclusivamente bugs críticos encontrados durante o desenvolvimento.",
    },

    correct: "B",
  },

  {
    id: 4,

    question:
      "Durante o planejamento da Sprint, o Scrum Team seleciona itens do Product Backlog e define como o trabalho será executado ao longo do ciclo. O conjunto dessas tarefas e objetivos definidos para a Sprint recebe um nome específico dentro do Scrum. O que representa esse artefato?",

    options: {
      A: "Uma lista de funcionários envolvidos no projeto.",
      B: "Um relatório financeiro utilizado para medir custos da Sprint.",
      C: "Os itens selecionados do Product Backlog juntamente com o plano de execução da Sprint.",
      D: "Toda a documentação técnica completa do sistema desenvolvido.",
    },

    correct: "C",
  },

  {
    id: 5,

    question:
      "Entre os eventos do Scrum, existe uma reunião diária que possui curta duração e tem como principal objetivo alinhar o trabalho dos Desenvolvedores, identificar impedimentos e acompanhar o progresso em direção à Sprint Goal. Qual evento possui duração máxima recomendada de 15 minutos?",

    options: {
      A: "Sprint Planning",
      B: "Sprint Retrospective",
      C: "Sprint Review",
      D: "Daily Scrum",
    },

    correct: "D",
  },

  {
    id: 6,

    question:
      "Durante uma Sprint, um stakeholder solicita a inclusão urgente de uma nova funcionalidade que não estava prevista no Sprint Backlog inicial. A equipe acredita que a mudança pode comprometer o objetivo da Sprint caso seja adicionada imediatamente. Segundo o Scrum Guide, qual deve ser a abordagem mais adequada para lidar com essa solicitação?",

    options: {
      A: "Adicionar automaticamente a funcionalidade ao Sprint Backlog, independentemente do impacto.",
      B: "Encaminhar a solicitação ao Product Owner para avaliar prioridade e impacto no Sprint Goal.",
      C: "Permitir que os Desenvolvedores decidam individualmente se irão implementar a funcionalidade.",
      D: "Ignorar completamente a solicitação até o encerramento do projeto.",
    },

    correct: "B",
  },

  {
    id: 7,

    question:
      "O Scrum Master desempenha um papel essencial dentro do Scrum Team, atuando não apenas como facilitador, mas também ajudando a organização a compreender e aplicar corretamente os princípios ágeis. Qual das alternativas descreve melhor uma das responsabilidades do Scrum Master?",

    options: {
      A: "Definir sozinho todas as prioridades do Product Backlog.",
      B: "Gerenciar diretamente os Desenvolvedores e distribuir tarefas diariamente.",
      C: "Garantir que o Scrum seja compreendido e aplicado corretamente pelo Scrum Team.",
      D: "Aprovar exclusivamente as entregas técnicas antes da Sprint Review.",
    },

    correct: "C",
  },

  {
    id: 8,

    question:
      "No Scrum, o conceito de Incremento está diretamente relacionado ao valor entregue ao final de cada Sprint. Para que um Incremento seja considerado válido, ele precisa atender a determinados critérios definidos previamente pelo Scrum Team. Qual alternativa representa corretamente esse conceito?",

    options: {
      A: "Uma versão parcial do produto que ainda não precisa estar funcional.",
      B: "Um conjunto de documentos técnicos criados durante a Sprint.",
      C: "O resultado do trabalho concluído que atende à Definition of Done e agrega valor ao produto.",
      D: "Uma estimativa inicial de funcionalidades futuras do sistema.",
    },

    correct: "C",
  },

  {
    id: 9,

    question:
      "A Sprint Retrospective é um evento importante para promover melhoria contínua dentro do Scrum Team. Durante essa reunião, os membros refletem sobre processos, comunicação, ferramentas e formas de trabalho utilizadas na Sprint anterior. Qual é o principal propósito desse evento?",

    options: {
      A: "Apresentar funcionalidades concluídas diretamente aos clientes finais.",
      B: "Planejar os requisitos técnicos completos das próximas releases.",
      C: "Identificar oportunidades de melhoria e definir ações para aumentar a eficiência da equipe.",
      D: "Avaliar individualmente os membros do Scrum Team com base em produtividade.",
    },

    correct: "C",
  },

  {
    id: 10,

    question:
      "Em um projeto que utiliza Scrum, a transparência é considerada um dos pilares fundamentais do framework. Isso significa que informações importantes relacionadas ao produto, progresso e impedimentos devem estar visíveis para todos os envolvidos. Qual prática contribui diretamente para fortalecer esse princípio?",

    options: {
      A: "Manter apenas os líderes informados sobre o andamento da Sprint.",
      B: "Documentar problemas somente ao final do projeto para evitar conflitos.",
      C: "Garantir que o Product Backlog e o progresso da Sprint estejam acessíveis e visíveis ao Scrum Team.",
      D: "Evitar reuniões frequentes para reduzir exposição de falhas da equipe.",
    },

    correct: "C",
  },
];

/* =========================================
   ESTADOS
========================================= */

let currentQuestionIndex = 0;

const userAnswers = {};

let reviewMode = false;

/* =========================================
   ELEMENTOS
========================================= */

const questionNumber = document.getElementById("questionNumber");

const questionText = document.getElementById("questionText");

const optionsBox = document.getElementById("optionsBox");

const progressWrapper = document.getElementById("progressWrapper");

const prevBtn = document.getElementById("prevBtn");

const nextBtn = document.getElementById("nextBtn");

const dialogComponent = document.querySelector("dialog-quiz");

/* =========================================
   RENDER PROGRESS
========================================= */

function renderProgress() {

  progressWrapper.innerHTML = "";

  questions.forEach((question, index) => {

    const progress =
      document.createElement("div");

    progress.classList.add("progress");

    /* =================================
       QUIZ NORMAL
    ================================= */

    if (!reviewMode) {

      // questão respondida
      if (userAnswers[index]) {

        progress.classList.add("answered");

      }

      // questão atual
      if (index === currentQuestionIndex) {

        progress.classList.add("current");

      }

      // TODAS navegáveis
      progress.classList.add("clickable");

      progress.addEventListener("click", () => {

        currentQuestionIndex = index;

        renderQuestion();

      });

    }

    /* =================================
       REVIEW MODE
    ================================= */

    else {

      const userAnswer =
        userAnswers[index];

      const correctAnswer =
        question.correct;

      // correta
      if (userAnswer === correctAnswer) {

        progress.classList.add("correct");

      }

      // errada
      else {

        progress.classList.add("wrong");

      }

      // questão atual
      if (index === currentQuestionIndex) {

        progress.classList.add("current");

      }

      // revisão navegável
      progress.classList.add("clickable");

      progress.addEventListener("click", () => {

        currentQuestionIndex = index;

        renderQuestion();

      });

    }

    progressWrapper.appendChild(progress);

  });

}

/* =========================================
   RENDER QUESTION
========================================= */

function renderQuestion() {

  const currentQuestion =
    questions[currentQuestionIndex];

  questionNumber.innerText =
    `${currentQuestion.id} -`;

  questionText.innerText =
    currentQuestion.question;

  optionsBox.innerHTML = "";

  Object.entries(currentQuestion.options)
    .forEach(([letter, text]) => {

      const option =
        document.createElement("div");

      option.classList.add("option");

      const selectedAnswer =
        userAnswers[currentQuestionIndex];

      /* =========================
         QUIZ NORMAL
      ========================= */

      if (!reviewMode) {

        if (selectedAnswer === letter) {
          option.classList.add("selected");
        }

      }

      /* =========================
         REVIEW MODE
      ========================= */

      else {

        option.classList.add("disabled");

        // correta
        if (
          letter === currentQuestion.correct
        ) {

          option.classList.add("correct");

        }

        // errada marcada
        if (
          selectedAnswer === letter &&
          selectedAnswer !== currentQuestion.correct
        ) {

          option.classList.add("wrong");

        }

      }

      option.innerHTML = `
        <div class="option-letter">
          ${letter}
        </div>

        <p class="option-text">
          ${text}
        </p>
      `;

      /* =========================
         CLICK APENAS QUIZ NORMAL
      ========================= */

      if (!reviewMode) {

        option.addEventListener("click", () => {

          document
            .querySelectorAll(".option")
            .forEach((opt) => {
              opt.classList.remove("selected");
            });

          option.classList.add("selected");

          userAnswers[currentQuestionIndex] =
          letter;

          // atualiza botão imediatamente
          updateButtons();

        });

      }

      optionsBox.appendChild(option);

    });

  renderProgress();

  updateButtons();

}

/* =========================================
   UPDATE BUTTONS
========================================= */

function updateButtons() {

  prevBtn.disabled =
    currentQuestionIndex === 0;

  /* =================================
     REVIEW MODE
  ================================= */

  if (reviewMode) {

    nextBtn.disabled = false;

    if (
      currentQuestionIndex ===
      questions.length - 1
    ) {

      nextBtn.innerText = "Concluir";

    } else {

      nextBtn.innerText = "Próxima";

    }

    return;

  }

  /* =================================
     QUIZ NORMAL
  ================================= */

  const allAnswered =
    questions.every((_, index) => {

      return userAnswers[index];

    });

  // última questão
  if (
    currentQuestionIndex ===
    questions.length - 1
  ) {

    nextBtn.innerText = "Finalizar";

    // permite responder a última
    // mas bloqueia finalizar
    // enquanto houver pendências
    nextBtn.disabled =
      !userAnswers[currentQuestionIndex];

  }

  else {

    nextBtn.innerText = "Prosseguir";

    nextBtn.disabled = false;

  }

}

/* =========================================
   NEXT BUTTON
========================================= */

nextBtn.addEventListener("click", () => {

  /* =================================
     REVIEW MODE
  ================================= */

  if (reviewMode) {

    if (
      currentQuestionIndex ===
      questions.length - 1
    ) {

      window.location.href = "/main";

      return;

    }

    currentQuestionIndex++;

    renderQuestion();

    return;

  }

  /* =================================
     QUIZ NORMAL
  ================================= */

  if (!userAnswers[currentQuestionIndex]) {

    alert("Selecione uma alternativa.");

    return;

  }

  // última questão
  if (
    currentQuestionIndex ===
    questions.length - 1
  ) {

    mostrarResultado();

    return;

  }

  currentQuestionIndex++;

  renderQuestion();

});

/* =========================================
   PREVIOUS BUTTON
========================================= */

prevBtn.addEventListener("click", () => {

  if (currentQuestionIndex > 0) {

    currentQuestionIndex--;

    renderQuestion();

  }

});

/* =========================================
   RESULTADO
========================================= */

function mostrarResultado() {

  let score = 0;

  questions.forEach((question, index) => {

    if (
      userAnswers[index] ===
      question.correct
    ) {

      score++;

    }

  });

  dialogComponent.setDados({
    mensagem:
      `Quiz finalizado! Acertos: ${score} de ${questions.length}`,

    nota: score
  });

  dialogComponent.dialog.showModal();

}

/* =========================================
   REVIEW MODE
========================================= */

function iniciarRevisao() {

  reviewMode = true;

  currentQuestionIndex = 0;

  document.body.classList.add("review-mode");

  dialogComponent.dialog.close();

  renderQuestion();

}

/* =========================================
   GLOBAL
========================================= */

window.iniciarRevisao = iniciarRevisao;

/* =========================================
   INIT
========================================= */

renderQuestion();