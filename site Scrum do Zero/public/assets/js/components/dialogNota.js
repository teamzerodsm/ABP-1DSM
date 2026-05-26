class LevelDialog extends HTMLElement {

  connectedCallback() {

    this.innerHTML = `
      <dialog class='dialog' id="dialog-quiz">

        <p class="dialog-level-label"
           id="dialog-quiz-mensagem">
        </p>

        <p class="dialog-title"
           id="dialog-quiz-nota">
        </p>

        <div class="dialog-actions">

          <a class="btn-cancelar"
             id="btn-revisao">
             Revisão
          </a>

          <a class="btn-prosseguir"
             href="/main">
             Concluir
          </a>

        </div>

      </dialog>
    `;

    this.dialog =
      this.querySelector("#dialog-quiz");

    this.dialogMensagem =
      this.querySelector("#dialog-quiz-mensagem");

    this.dialogNota =
      this.querySelector("#dialog-quiz-nota");

    this.btnResume =
      this.querySelector("#btn-revisao");

    /* =========================
       REVIEW BUTTON
    ========================= */

    this.btnResume
      .addEventListener("click", () => {

        this.dialog.close();

        window.iniciarRevisao();

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

}

customElements.define("dialog-quiz",LevelDialog);