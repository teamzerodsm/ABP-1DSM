import "./components/dialogNota.js";
const BASE_URL = "/api";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/index";
}

console.debug("[quiz-page] token present:", !!token);

const headers = {
  Authorization: `Bearer ${token}`,
};

const params = new URLSearchParams(window.location.search);
const idModulo = Number(params.get("modulo"));
const idExameFromUrl = Number(params.get("id_exame"));
const reviewModeUrl = params.get("review") === "true";

let idExame = null;
let questions = [];

async function fetchJson(path, options = {}) {
  console.debug("[quiz-page] fetch", path, options.method || "GET", headers);
  const response = await fetch(`${BASE_URL}${path}`, Object.assign({}, options, { headers: { ...headers, ...options.headers } }));
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function getErrorMessage(result, fallback = "Erro ao conectar com o servidor.") {
  return result.data?.message || fallback;
}

async function iniciarOuRetomar() {
  if (reviewModeUrl && idExameFromUrl > 0) {
    document.querySelector(".module-title").innerText = idModulo ? `Módulo ${idModulo}` : "Revisão";
    return iniciarRevisaoPorId(idExameFromUrl);
  }

  if (!idModulo || !Number.isInteger(idModulo)) {
    alert("Módulo inválido. Retornando ao início.");
    window.location.href = "/main";
    return;
  }

  document.querySelector(".module-title").innerText = `Módulo ${idModulo}`;

  const ativo = await fetchJson(`/exames/ativo/${idModulo}`);
  if (ativo.response.ok) {
    idExame = ativo.data.id_exame;
    return carregarExame(idExame);
  }

  if (ativo.response.status !== 404) {
    alert(getErrorMessage(ativo, "Erro ao verificar exame em andamento."));
    window.location.href = "/main";
    return;
  }

  return criarExame();
}

async function carregarExame(exameId) {
  const result = await fetchJson(`/exames/${exameId}`);
  if (!result.response.ok) {
    alert(getErrorMessage(result, "Erro ao carregar o exame."));
    window.location.href = "/main";
    return;
  }

  questions = adaptarQuestoes(result.data.questions);

  // Recuperar estado anterior se existir
  const savedState = loadQuizState();
  if (savedState && savedState.idExame === exameId) {
    Object.assign(userAnswers, savedState.userAnswers);
    currentQuestionIndex = savedState.currentQuestionIndex;
    console.debug("[quiz-page] Estado anterior restaurado");
  }

  renderQuestion();
}

async function criarExame() {
  const result = await fetchJson("/exames", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_modulo: idModulo }),
  });

  if (!result.response.ok) {
    if (result.response.status === 409 && result.data.message?.includes("em andamento")) {
      return iniciarOuRetomar();
    }
    alert(getErrorMessage(result, "Erro ao iniciar o exame."));
    window.location.href = "/main";
    return;
  }

  idExame = result.data.exame.id_exame;
  questions = adaptarQuestoes(result.data.questions);

  // Recuperar estado anterior se existir
  const savedState = loadQuizState();
  if (savedState && savedState.idExame === idExame) {
    Object.assign(userAnswers, savedState.userAnswers);
    currentQuestionIndex = savedState.currentQuestionIndex;
    console.debug("[quiz-page] Estado anterior restaurado");
  }

  renderQuestion();
}

async function iniciarRevisaoPorId(exameId) {
  const result = await fetchJson(`/exames/${exameId}/revisao`);
  if (!result.response.ok) {
    alert(getErrorMessage(result, "Erro ao abrir a revisão do exame."));
    window.location.href = "/main";
    return;
  }

  questions = result.data.items.map((item, i) => {
    userAnswers[i] = item.resposta_usuario;
    return {
      id: item.id_questao,
      question: item.enunciado,
      options: {
        a: item.alternativa_a,
        b: item.alternativa_b,
        c: item.alternativa_c,
        d: item.alternativa_d
      },
      correct: item.alternativa_correta,
      imagem: item.imagem || null,
    };
  });

  reviewMode = true;
  currentQuestionIndex = 0;
  document.body.classList.add("review-mode");
  document.querySelector(".module-title").innerText = idModulo ? `Módulo ${idModulo}` : "Revisão";
  renderQuestion();
}

/* =========================================
   PERSISTÊNCIA
========================================= */

function getSessionKey() {
  return `quiz_session_${idExame}`;
}

function saveQuizState() {
  const state = {
    currentQuestionIndex,
    userAnswers,
    idExame,
    idModulo,
    timestamp: Date.now(),
  };
  localStorage.setItem(getSessionKey(), JSON.stringify(state));
  console.debug("[quiz-page] Estado salvo no localStorage", state);
}

function loadQuizState() {
  if (!idExame) return null;
  const saved = localStorage.getItem(getSessionKey());
  if (saved) {
    try {
      const state = JSON.parse(saved);
      console.debug("[quiz-page] Estado carregado do localStorage", state);
      return state;
    } catch (e) {
      console.warn("[quiz-page] Erro ao parsear estado salvo", e);
    }
  }
  return null;
}

function clearQuizState() {
  localStorage.removeItem(getSessionKey());
  console.debug("[quiz-page] Estado limpo do localStorage");
}

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

function adaptarQuestoes(raw) {
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
    imagem: q.imagem && q.imagem !== "NULL" ? q.imagem : null,  // ← fix
  }));
}
/* =========================================
   RENDER PROGRESS
========================================= */

function renderProgress() {
  progressWrapper.innerHTML = "";

  questions.forEach((question, index) => {
    const progress = document.createElement("div");
    progress.classList.add("progress");

    if (!reviewMode) {
      if (userAnswers[index]) progress.classList.add("answered");
      if (index === currentQuestionIndex) progress.classList.add("current");

      // Só permite clicar em perguntas já respondidas ou a atual
      if (userAnswers[index] || index === currentQuestionIndex) {
        progress.classList.add("clickable");
        progress.addEventListener("click", () => {
          currentQuestionIndex = index;
          saveQuizState();
          renderQuestion();
        });
      }

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
  questionText.innerText = currentQuestion.question;

  const questionImg = document.getElementById("questionImg");
  console.log("imagem:", currentQuestion.imagem, "img el:", questionImg);
  if (currentQuestion.imagem) {
    questionImg.src = `/imagens/questoes/${currentQuestion.imagem}`;
    questionImg.style.display = "block";
  } else {
    questionImg.removeAttribute("src");
    questionImg.style.display = "none";
  }
  optionsBox.innerHTML = "";

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
        saveQuizState();
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
    nextBtn.disabled = !userAnswers[currentQuestionIndex];
  } else {
    nextBtn.innerText = "Prosseguir";
    nextBtn.disabled = false;
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
  saveQuizState();
  renderQuestion();
});

/* =========================================
   PREVIOUS BUTTON
========================================= */

prevBtn.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    saveQuizState();
    renderQuestion();
  }
});

/* =========================================
   RESULTADO
========================================= */

async function mostrarResultado() {
  // Preparar respostas e abrir diálogo de verificação
  const answers = questions.map((q, index) => ({ id_questao: q.id, resposta: userAnswers[index] }));

  // Guarda as respostas pendentes no componente para o handler usar
  dialogComponent._pendingAnswers = answers;

  // Anexa o listener de confirmação apenas uma vez
  if (!dialogComponent._confirmListenerAdded) {
    dialogComponent.addEventListener("confirm-submit", async () => {
      if (dialogComponent._sending) return;
      dialogComponent._sending = true;
      nextBtn.disabled = true;
      try {
        const res = await fetch(`${BASE_URL}/exames/${idExame}/respostas`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(dialogComponent._pendingAnswers || []),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Erro ao enviar as respostas.");
        }

        // Limpar estado salvo após enviar com sucesso
        clearQuizState();

        if (typeof dialogComponent.showCompleted === "function") {
          dialogComponent.showCompleted({ mensagem: `Quiz finalizado! Acertos: ${data.score} de ${data.total}`, nota: data.score });
        } else {
          const mensagemEl = dialogComponent.querySelector("#dialog-quiz-mensagem");
          const notaEl = dialogComponent.querySelector("#dialog-quiz-nota");
          if (mensagemEl) mensagemEl.innerText = `Quiz finalizado! Acertos: ${data.score} de ${data.total}`;
          if (notaEl) notaEl.innerText = data.score;
          const dialogEl = dialogComponent.querySelector && dialogComponent.querySelector("#dialog-quiz");
          if (dialogEl && dialogEl.showModal) dialogEl.showModal();
        }
      } catch (error) {
        console.error(error);
        alert(error.message || "Erro ao enviar as respostas.");
        nextBtn.disabled = false;
      } finally {
        dialogComponent._sending = false;
      }
    });
    dialogComponent._confirmListenerAdded = true;
  }

  if (typeof dialogComponent.showVerify === "function") {
    dialogComponent.showVerify();
  } else {
    const dialogEl = dialogComponent.querySelector && dialogComponent.querySelector("#dialog-quiz");
    if (dialogEl && dialogEl.showModal) dialogEl.showModal();
  }
}

/* =========================================
   REVIEW MODE
========================================= */

async function iniciarRevisao() {
  const res = await fetch(`${BASE_URL}/exames/${idExame}/revisao`, { headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    alert(data.message || "Erro ao carregar a revisão do exame.");
    return;
  }

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
  const dialogQuiz = dialogComponent?.querySelector("#dialog-quiz");
  if (dialogQuiz && dialogQuiz.open) {
    dialogQuiz.close();
  }
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