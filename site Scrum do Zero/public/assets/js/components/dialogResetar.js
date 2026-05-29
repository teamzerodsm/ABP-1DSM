class LevelDialog extends HTMLElement {

    connectedCallback() {
  
      this.innerHTML = `
        <dialog class='dialog' id="dialog-quiz">

            <h2 class="dialog-level-label">Você tem certeza que quer enviar o questionário?</h2>

            <p class="dialog-title">Digite "RESETAR" para confirmar</p>

            <input class="input-dialog-reset" type="text" id="word-reset"/>
  
            <div class="dialog-actions">
              <a class="btn-cancelar"
                id="btn-retornar-reset"
                href="#">
                Cancelar
              </a>
  
              <a class="btn-prosseguir"
                id="btn-avancar-reset"
                href="#">
                Avançar
              </a>
            </div>
    
        </dialog>
      `;
  
      this.dialog = this.querySelector("#dialog-quiz");
  
      this.dialogMensagem = this.querySelector("#dialog-quiz-mensagem");
      this.dialogNota = this.querySelector("#dialog-quiz-nota");
  
      this.btnRetornar = this.querySelector("#btn-retornar-reset");
      this.btnEnviar = this.querySelector("#btn-avancar-reset");
  
      /* =========================
         VERIFY - RETORNAR (volta ao fluxo da página)
      ========================= */
      this.btnRetornar.addEventListener("click", (e) => {
        e.preventDefault();
        this.dialog.close();
      });
  
      /* =========================
         CLICK OUTSIDE
      ========================= */
  
      this.dialog.addEventListener("click", (event) => {
  
        const rect = this.dialog.getBoundingClientRect();
  
        const isInDialog =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
  
        if (!isInDialog) {
          const verify = this.querySelector(".dialog");
          const verifyVisible = verify && getComputedStyle(verify).display !== "none";
          if (verifyVisible) {
            this.dialog.close();
          }
        }
  
      });
  
    }
  
  }
  
  customElements.define("dialog-quiz",LevelDialog);