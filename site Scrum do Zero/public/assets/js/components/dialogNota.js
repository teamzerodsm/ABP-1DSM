class LevelDialog extends HTMLElement {

  connectedCallback() {

    this.innerHTML = `
      <dialog class='dialog' id="dialog-quiz">

        <div class="dialog-quiz-verify">
          <h3 class="dialog-level-label">Você tem certeza que quer enviar o questionário?</h3>

            <a class="btn-cancelar"
              id="btn-retornar-verify"
              href="#">
              Retornar
            </a>

            <a class="btn-prosseguir"
              id="btn-enviar"
              href="#">
              Enviar
            </a>

        </div>

        <div class="dialog-quiz-completed" style="display:none;">

          <p class="dialog-level-label"
            id="dialog-quiz-mensagem">
          </p>

          <p class="dialog-title"
            id="dialog-quiz-nota">
          </p>

          <div class="dialog-actions">

            <a class="btn-cancelar"
              id="btn-revisao-complete"
              href="#">
              Revisão
            </a>

            <a class="btn-prosseguir"
              id="btn-concluir"
              href="#">
              Concluir
            </a>

          </div>

        </div>

      </dialog>
    `;

    this.dialog =
      this.querySelector("#dialog-quiz");

    this.dialogMensagem = this.querySelector("#dialog-quiz-mensagem");
    this.dialogNota = this.querySelector("#dialog-quiz-nota");

    this.btnRetornarVerify = this.querySelector("#btn-retornar-verify");
    this.btnEnviar = this.querySelector("#btn-enviar");
    this.btnRevisaoComplete = this.querySelector("#btn-revisao-complete");
    this.btnConcluir = this.querySelector("#btn-concluir");

    /* =========================
       VERIFY - RETORNAR (volta ao quiz)
    ========================= */
    this.btnRetornarVerify.addEventListener("click", (e) => {
      e.preventDefault();
      this.dialog.close();
    });

    /* =========================
       VERIFY - ENVIAR (confirma envio)
    ========================= */
    this.btnEnviar.addEventListener("click", (e) => {
      e.preventDefault();
      // dispara evento para que o controlador do quiz envie as respostas
      this.dispatchEvent(new CustomEvent("confirm-submit", { bubbles: true }));
    });

    /* =========================
       COMPLETED - REVISÃO
    ========================= */
    this.btnRevisaoComplete.addEventListener("click", (e) => {
      e.preventDefault();
      this.dialog.close();
      if (typeof window.iniciarRevisao === "function") window.iniciarRevisao();
    });

    /* =========================
       COMPLETED - CONCLUIR
    ========================= */
    this.btnConcluir.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/main";
    });


  }

  /* =========================
     SET DADOS
  ========================= */

  setDados(dados) {
    this.dialogMensagem = this.querySelector("#dialog-quiz-mensagem");
    this.dialogNota = this.querySelector("#dialog-quiz-nota");

    this.dialogMensagem.innerText = dados.mensagem;
    this.dialogNota.innerText = dados.nota;
  }

  showVerify() {
    const verify = this.querySelector(".dialog-quiz-verify");
    const completed = this.querySelector(".dialog-quiz-completed");
    verify.style.display = "block";
    completed.style.display = "none";
    this.dialog.showModal();
  }

  showCompleted(dados = {}) {
    const verify = this.querySelector(".dialog-quiz-verify");
    const completed = this.querySelector(".dialog-quiz-completed");
    verify.style.display = "none";
    completed.style.display = "block";
    this.setDados(dados);
  }

}

customElements.define("dialog-quiz",LevelDialog);