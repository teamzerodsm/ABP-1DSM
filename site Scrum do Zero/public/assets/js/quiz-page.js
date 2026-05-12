import "./components/dialogNota.js";

/* =========================================
   BANCO DE DADOS FICTÍCIO
========================================= */

const questions = [
  {
    id: 1,

    question:
      "Durante a Daily Scrum, os Desenvolvedores percebem que o trabalho planejado é mais complexo do que o esperado. Qual deve ser a ação correta?",

    options: {
      A: "Ajustar o escopo do Sprint Backlog junto ao Product Owner.",
      B: "Cancelar imediatamente a Sprint.",
      C: "Trabalhar horas extras obrigatoriamente.",
      D: "Ignorar o problema até o final da Sprint.",
    },

    correct: "A",
  },

  {
    id: 2,

    question:
      "Quem é responsável por maximizar o valor do produto resultante do trabalho do Scrum Team?",

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
      "Qual é o principal objetivo da Sprint Review?",

    options: {
      A: "Planejar a próxima Sprint",
      B: "Apresentar o incremento aos stakeholders",
      C: "Avaliar desempenho individual",
      D: "Corrigir bugs críticos",
    },

    correct: "B",
  },

  {
    id: 4,

    question:
      "O que representa o Sprint Backlog?",

    options: {
      A: "Lista de funcionários",
      B: "Relatório financeiro",
      C: "Itens selecionados para a Sprint",
      D: "Documentação técnica completa",
    },

    correct: "C",
  },

  {
    id: 5,

    question:
      "Qual evento possui duração máxima de 15 minutos?",

    options: {
      A: "Sprint Planning",
      B: "Sprint Retrospective",
      C: "Sprint Review",
      D: "Daily Scrum",
    },

    correct: "D",
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

const questionNumber =
  document.getElementById("questionNumber");

const questionText =
  document.getElementById("questionText");

const optionsBox =
  document.getElementById("optionsBox");

const progressWrapper =
  document.getElementById("progressWrapper");

const prevBtn =
  document.getElementById("prevBtn");

const nextBtn =
  document.getElementById("nextBtn");

const dialogComponent =
  document.querySelector("dialog-quiz");

/* =========================================
   RENDER PROGRESS
========================================= */

function renderProgress() {

  progressWrapper.innerHTML = "";

  questions.forEach((question, index) => {

    const progress =
      document.createElement("div");

    progress.classList.add("progress");

    /* =========================
       QUIZ NORMAL
    ========================= */

    if (!reviewMode) {

      if (index <= currentQuestionIndex) {
        progress.classList.add("active");
      }

    }

    /* =========================
       REVIEW MODE
    ========================= */

    else {

      const userAnswer =
        userAnswers[index];

      const correctAnswer =
        question.correct;

      if (userAnswer === correctAnswer) {

        progress.classList.add("correct");

      } else {

        progress.classList.add("wrong");

      }

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

  /* =========================
     REVIEW MODE
  ========================= */

  if (reviewMode) {

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

  /* =========================
     QUIZ NORMAL
  ========================= */

  if (
    currentQuestionIndex ===
    questions.length - 1
  ) {

    nextBtn.innerText = "Finalizar";

  } else {

    nextBtn.innerText = "Prosseguir";

  }

}

/* =========================================
   NEXT BUTTON
========================================= */

nextBtn.addEventListener("click", () => {

  /* =========================
     REVIEW MODE
  ========================= */

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

  /* =========================
     QUIZ NORMAL
  ========================= */

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

window.iniciarRevisao =
  iniciarRevisao;

/* =========================================
   INIT
========================================= */

renderQuestion();