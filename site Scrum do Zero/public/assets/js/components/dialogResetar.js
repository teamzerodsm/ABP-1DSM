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
      this.inputReset = this.querySelector("#word-reset");
  
      /* =========================
         VERIFY - RETORNAR (volta ao fluxo da página)
      ========================= */
      this.btnRetornar.addEventListener("click", (e) => {
        e.preventDefault();
        this.dialog.close();
      });

      /* =========================
         VERIFY - ENVIAR (executa reset no backend)
      ========================= */
      this.btnEnviar.addEventListener("click", async (e) => {
        e.preventDefault();
        const value = (this.inputReset && this.inputReset.value || "").trim();
        if (value.toUpperCase() !== "RESETAR") {
          alert('Digite "RESETAR" para confirmar o reset do progresso.');
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          alert('Usuário não autenticado. Faça login novamente.');
          return window.location.href = '/index';
        }

        try {
          const res = await fetch('/api/exames/resetar', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err.message || 'Não foi possível resetar o progresso.');
            return;
          }

          alert('Progresso resetado com sucesso. A página será recarregada.');
          this.dialog.close();
          window.location.reload();
        } catch (err) {
          console.error(err);
          alert('Erro ao conectar com o servidor. Tente novamente.');
        }
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