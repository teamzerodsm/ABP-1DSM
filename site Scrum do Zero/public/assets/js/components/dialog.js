class LevelDialog extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
     <dialog class='dialog' id="dialog-modules">
            <p class="dialog-level-label" id="dialog-level"></p>
            <p class="dialog-title" id="dialog-title"></p>
            <p class="dialog-description" id="dialog-desc"></p>
            <div class="dialog-info-container">
                <p class="dialog-info" id="dialog-attempts"></p>
                <p class="dialog-info" id="dialog-points"></p>
            </div>

            <div class="dialog-actions">
                <a class="secondary-button btn-cancelar">Cancelar</a>
                <a class="secondary-button btn-prosseguir" href="/quiz-page">Prosseguir</a>
            </div>
        </dialog>
        `;

    this.dialog = this.querySelector("#dialog-modules");
    this.dialogLevel = this.querySelector("#dialog-level");
    this.dialogTitle = this.querySelector("#dialog-title");
    this.dialogDesc = this.querySelector("#dialog-desc");
    this.dialogAttempts = this.querySelector("#dialog-attempts");
    this.dialogPoints = this.querySelector("#dialog-points");
    this.btnProsseguir = this.querySelector(".btn-prosseguir");

    this.querySelector(".btn-cancelar").addEventListener("click", () => {
      this.dialog.close();
    });

    this.dialog.addEventListener("click", (event) => {
      const rect = this.dialog.getBoundingClientRect();
      const isInDialog =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!isInDialog) this.dialog.close();
    });
  }

  setDados(dados) {
  this.dialogLevel.innerText = dados.level ?? "";
  this.dialogTitle.innerText = dados.titulo ?? "";
  this.dialogDesc.innerText = dados.descricao ?? "";
  this.dialogAttempts.innerText = `Tentativas Restantes: ${dados.tentativas}`;
  this.dialogPoints.innerText = `Melhor Pontuação: ${dados.pontos}`;
  this.btnProsseguir.href = `/quiz-page?modulo=${dados.idModulo}`;

  if (dados.tentativas === 0) {
    this.btnProsseguir.classList.add("disabled");
    this.btnProsseguir.removeAttribute("href");
  } else {
    this.btnProsseguir.classList.remove("disabled");
    this.btnProsseguir.href = `/quiz-page?modulo=${dados.idModulo}`;
  }
}
}

customElements.define("dialog-modules", LevelDialog);
