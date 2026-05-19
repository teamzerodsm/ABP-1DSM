class LevelDialog extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <dialog id="dialog-modules" style="
    border: none;
    border-radius: 16px;
    padding: 2rem;
    width: 360px;
    background: white;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    color: black;
    font-family: var(--font-sans);
  ">
  
    <p id="dialog-level" style="
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: black;
      margin: 0 0 6px;
    "></p>
  
    <p id="dialog-title" style="
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 8px;
      color: black;
    "></p>
  
    <p id="dialog-desc" style="
      font-size: 14px;
      color: black;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    "></p>
  
    <div style="
      display: flex;
      gap: 12px;
      margin-bottom: 1.5rem;
    ">
  
      <div style="
        flex: 1;
        background: var(--color-background-secondary);
        border-radius: 10px;
        padding: 10px 14px;
      ">
        <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 0 0 2px;">Tentativas</p>
        <p id="dialog-attempts" style="font-size: 20px; font-weight: 500; margin: 0; color: var(--color-text-primary);"></p>
      </div>
  
      <div style="
        flex: 1;
        background: var(--color-background-secondary);
        border-radius: 10px;
        padding: 10px 14px;
      ">
        <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 0 0 2px;">Pontos</p>
        <p id="dialog-points" style="font-size: 20px; font-weight: 500; margin: 0; color: var(--color-text-primary);"></p>
      </div>
  
    </div>
  
    <div style="display: flex; gap: 10px;">
      <a class="btn-cancelar" style="
        flex: 1;
        text-align: center;
        padding: 10px 0;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border: 0.5px solid var(--color-border-secondary);
        color: var(--color-text-secondary);
        text-decoration: none;
      ">Cancelar</a>
  
      <a class="btn-prosseguir" style="
        flex: 1;
        text-align: center;
        padding: 10px 0;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        background: green;
        color: #fff;
        text-decoration: none;
      ">Prosseguir</a>
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
    this.dialogAttempts.innerText = dados.tentativas ?? "-";
    this.dialogPoints.innerText = dados.pontos ?? "-";
    this.btnProsseguir.href = `/quiz-page?modulo=${dados.idModulo}`;
  }
}

customElements.define("dialog-modules", LevelDialog);
