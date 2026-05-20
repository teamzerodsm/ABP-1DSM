import "./components/dialogNota.js"; 
const BASE_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const params = new URLSearchParams(window.location.search);
const idModulo = Number(params.get("modulo"));

let idExame = null;
let questions = [];

/* =========================================
   ESTADOS
========================================= */

let currentQuestionIndex = 0;
const userAnswers = {};
let reviewMode = false;

/* =========================================
   ELEMENTOS
========================================= */

const questionNumber  = document.getElementById("questionNumber");
const questionText    = document.getElementById("questionText");
const optionsBox      = document.getElementById("optionsBox");
const progressWrapper = document.getElementById("progressWrapper");
const prevBtn         = document.getElementById("prevBtn");
const nextBtn         = document.getElementById("nextBtn");
const dialogComponent = document.querySelector("dialog-quiz");

/* =========================================
   API
========================================= */

async function iniciarOuRetomar() {
  const res = await fetch(`${BASE_URL}/exames`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id_modulo: idModulo }),
  });
  
  const data = await res.json();

  if (res.status === 409 && data.message.includes("em andamento")) {
    await retomarExame();
    return;
  }

  if (!res.ok) {
    alert(data.message);
    window.location.href = "/main";
    return;
  }

  idExame = data.exame.id_exame;
  questions = adaptarQuestoes(data.questions);
  renderQuestion();
}

async function retomarExame() {
  const res = await fetch(`${BASE_URL}/exames/historico`, { headers });
  const data = await res.json();

  const modulo = data.find((m) => m.id_modulo == idModulo);
  const exameAtivo = modulo?.tentativas.find((t) => t.respostas_respondidas === 0);

  if (!exameAtivo) {
    alert("Erro ao retomar exame.");
    window.location.href = "/main";
    return;
  }

  idExame = exameAtivo.id_exame;

  const res2 = await fetch(`${BASE_URL}/exames/${idExame}`, { headers });
  const data2 = await res2.json();

  questions = adaptarQuestoes(data2.questions);
  renderQuestion();
}

function adaptarQuestoes(raw) {
  console.log("raw[0]:", raw[0]);
  return raw.map((q) => ({
    id: q.id_questao,
    question: q.enunciado,
    options: {
      a: q.alternativa_a,
      b: q.alternativa_b,
      c: q.alternativa_c,
      d: q.alternativa_d,
    },
    correct: q.alternativa_correta,
  }));
}
document.querySelector(".module-title").innerText = `Módulo ${idModulo}`;
/* =========================================
   RENDER PROGRESS
========================================= */

function renderProgress() {
  progressWrapper.innerHTML = "";

  questions.forEach((question, index) => {
    const progress = document.createElement("div");
    progress.classList.add("progress");

    if (!reviewMode) {
      if (userAnswers[index])          progress.classList.add("answered");
      if (index === currentQuestionIndex) progress.classList.add("current");

      progress.classList.add("clickable");
      progress.addEventListener("click", () => {
        currentQuestionIndex = index;
        renderQuestion();
      });

    } else {
      const acertou = userAnswers[index] === question.correct;
      progress.classList.add(acertou ? "correct" : "wrong");
      if (index === currentQuestionIndex) progress.classList.add("current");

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
  const currentQuestion = questions[currentQuestionIndex];

  questionNumber.innerText = `${currentQuestionIndex + 1} -`;
  questionText.innerText   = currentQuestion.question;
  optionsBox.innerHTML     = "";

  Object.entries(currentQuestion.options).forEach(([letter, text]) => {
    const option = document.createElement("div");
    option.classList.add("option");

    const selectedAnswer = userAnswers[currentQuestionIndex];

    if (!reviewMode) {
      if (selectedAnswer === letter) option.classList.add("selected");
    } else {
      option.classList.add("disabled");
      if (letter === currentQuestion.correct) option.classList.add("correct");
      if (selectedAnswer === letter && selectedAnswer !== currentQuestion.correct)
        option.classList.add("wrong");
    }

    option.innerHTML = `
      <div class="option-letter">${letter}</div>
      <p class="option-text">${text}</p>
    `;

    if (!reviewMode) {
      option.addEventListener("click", () => {
        document.querySelectorAll(".option").forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");
        userAnswers[currentQuestionIndex] = letter;
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
  prevBtn.disabled = currentQuestionIndex === 0;

  if (reviewMode) {
    nextBtn.disabled = false;
    nextBtn.innerText = currentQuestionIndex === questions.length - 1 ? "Concluir" : "Próxima";
    return;
  }

  if (currentQuestionIndex === questions.length - 1) {
    nextBtn.innerText = "Finalizar";
    nextBtn.disabled  = !userAnswers[currentQuestionIndex];
  } else {
    nextBtn.innerText = "Prosseguir";
    nextBtn.disabled  = false;
  }
}

/* =========================================
   NEXT BUTTON
========================================= */

nextBtn.addEventListener("click", async () => {
  if (reviewMode) {
    if (currentQuestionIndex === questions.length - 1) {
      window.location.href = "/main";
      return;
    }
    currentQuestionIndex++;
    renderQuestion();
    return;
  }

  if (!userAnswers[currentQuestionIndex]) {
    alert("Selecione uma alternativa.");
    return;
  }

  if (currentQuestionIndex === questions.length - 1) {
    await mostrarResultado();
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

async function mostrarResultado() {
  nextBtn.disabled = true;

  const answers = questions.map((q, index) => ({
    id_questao: q.id,
    resposta: userAnswers[index],
  }));
  
  console.log("answers enviados:", answers);
  console.log("userAnswers:", userAnswers);
  console.log("questions:", questions.map(q => ({ id: q.id, correct: q.correct })));

  const res = await fetch(`${BASE_URL}/exames/${idExame}/respostas`, {
    method: "POST",
    headers,
    body: JSON.stringify(answers),
  });

  const data = await res.json();

  if (!res.ok) {
    nextBtn.disabled = false;
    alert(data.message);
    return;
  }

  // verifica se o innerHTML já foi renderizado
  const mensagemEl = dialogComponent.querySelector("#dialog-quiz-mensagem");
  const notaEl     = dialogComponent.querySelector("#dialog-quiz-nota");
  const dialogEl   = dialogComponent.querySelector("#dialog-quiz");

  console.log("mensagemEl:", mensagemEl);
  console.log("notaEl:", notaEl);
  console.log("dialogEl:", dialogEl);

  if (!mensagemEl || !notaEl || !dialogEl) {
    console.error("Elementos do dialog não encontrados. innerHTML:", dialogComponent.innerHTML);
    return;
  }

  mensagemEl.innerText = `Quiz finalizado! Acertos: ${data.score} de ${data.total}`;
  notaEl.innerText     = data.score;
  dialogEl.showModal();
}

/* =========================================
   REVIEW MODE
========================================= */

async function iniciarRevisao() {
  const res  = await fetch(`${BASE_URL}/exames/${idExame}/resultado`, { headers });
  const data = await res.json();

  questions = data.items.map((item, i) => {
    userAnswers[i] = item.resposta_usuario;
    return {
      id: item.id_questao,
      question: item.enunciado,
      options: {
        a: item.alternativa_a,
        b: item.alternativa_b,
        c: item.alternativa_c,
        d: item.alternativa_d,
      },
      correct: item.alternativa_correta,
    };
  });

  reviewMode = true;
  currentQuestionIndex = 0;
  document.body.classList.add("review-mode");
  dialogComponent.querySelector("#dialog-quiz").close();
  renderQuestion();
}

/* =========================================
   GLOBAL
========================================= */

window.iniciarRevisao = iniciarRevisao;

/* =========================================
   INIT
========================================= */

iniciarOuRetomar();