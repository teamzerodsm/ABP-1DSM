class LevelDialog extends HTMLElement {
  connectedCallback() {

    this.innerHTML = `
        <dialog class='dialog' id="dialog-modules">
            <p class="dialog-level-label" id="dialog-level"></p>
            <p class="dialog-title" id="dialog-title"></p>
            <p class="dialog-description" id="dialog-desc"></p>
            <p class="dialog-info" id="dialog-attempts"></p>
            <p class="dialog-info" id="dialog-points"></p>

            <div class="dialog-actions">
                <a class="btn-cancelar">Cancelar</a>
                <a class="btn-prosseguir" href="/quiz-page">Prosseguir</a>
            </div>
        </dialog>
        `;

    this.dialog = this.querySelector("#dialog-modules");
    this.dialogLevel = this.querySelector("#dialog-level");
    this.dialogTitle = this.querySelector("#dialog-title");
    this.dialogDesc = this.querySelector("#dialog-desc");
    this.dialogAttempts = this.querySelector("#dialog-attempts");
    this.dialogPoints = this.querySelector("#dialog-points");
    
    this.querySelector(".btn-cancelar").addEventListener("click", () => {
      this.dialog.close();
    });

    this.btn;Resume = this.querySelector(".btn-prosseguir");

    this.dialog.addEventListener("click", (event) => {
      const rect = this.dialog.getBoundingClientRect();
      const isInDialog =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isInDialog) {
        this.dialog.close();
      }
    });
  }

  setDados(dados){
    this.dialogLevel.innerText = dados.level;
    this.dialogTitle.innerText = dados.titulo;
    this.dialogDesc.innerText = dados.descricao;
    this.dialogAttempts.innerText = dados.tentativas;
    this.dialogPoints.innerText = dados.pontos;
  }

}

customElements.define("dialog-modules", LevelDialog);
