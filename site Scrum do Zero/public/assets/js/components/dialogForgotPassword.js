class ForgotPasswordDialog extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <dialog class="dialog dialog-forgot-password" id="dialog-forgot-password">
        <div class="forgot-password-content">
          <!-- PASSO 1: EMAIL -->
          <div class="step step-1 active">
            <h2>Recuperar Senha</h2>
            <p>Digite seu email para receber um código de recuperação</p>
            
            <div class="form-group">
              <label for="forgot-email">Email cadastrado:</label>
              <input type="email" id="forgot-email" placeholder="seu@email.com" class="form-input">
              <p id="forgot-email-error" class="error-message"></p>
            </div>

            <div class="dialog-actions">
              <button class="secondary-button btn-cancel" id="btn-cancel-forgot">Cancelar</button>
              <button class="secondary-button btn-proceed" id="btn-send-code">Enviar código</button>
            </div>
          </div>

          <!-- PASSO 2: CÓDIGO -->
          <div class="step step-2">
            <h2>Verificar Código</h2>
            <p>Digite o código enviado para seu email</p>
            
            <div class="form-group">
              <label for="forgot-code">Código de recuperação:</label>
              <input type="text" id="forgot-code" placeholder="000000" maxlength="6" class="form-input code-input">
              <p id="forgot-code-error" class="error-message"></p>
              <p class="code-timer" id="code-timer"></p>
            </div>

            <div class="dialog-actions">
              <button class="secondary-button btn-back" id="btn-back-email">Voltar</button>
              <button class="secondary-button btn-proceed" id="btn-verify-code">Verificar</button>
            </div>
          </div>

          <!-- PASSO 3: NOVA SENHA -->
          <div class="step step-3">
            <h2>Nova Senha</h2>
            <p>Digite sua nova senha</p>
            
            <div class="form-group">
              <label for="forgot-password">Nova senha:</label>
              <input type="password" id="forgot-password" placeholder="Mínimo 6 caracteres" class="form-input">
              <p id="forgot-password-error" class="error-message"></p>
            </div>

            <div class="form-group">
              <label for="forgot-password-confirm">Confirmar senha:</label>
              <input type="password" id="forgot-password-confirm" placeholder="Confirme sua senha" class="form-input">
              <p id="forgot-password-confirm-error" class="error-message"></p>
            </div>

            <div class="dialog-actions">
              <button class="secondary-button btn-cancel" id="btn-cancel-password">Cancelar</button>
              <button class="secondary-button btn-proceed" id="btn-reset-password">Alterar Senha</button>
            </div>
          </div>

          <!-- SUCESSO -->
          <div class="step step-success">
            <div class="success-icon">✓</div>
            <h2>Senha Alterada!</h2>
            <p>Sua senha foi alterada com sucesso. Faça login com sua nova senha.</p>
            
            <div class="dialog-actions">
              <button class="secondary-button btn-proceed" id="btn-close-success">Fechar</button>
            </div>
          </div>
        </div>
      </dialog>
    `;

    this.dialog = this.querySelector("#dialog-forgot-password");
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const emailInput = this.querySelector("#forgot-email");
    const codeInput = this.querySelector("#forgot-code");
    const passwordInput = this.querySelector("#forgot-password");
    const passwordConfirmInput = this.querySelector("#forgot-password-confirm");

    // Estado
    let currentStep = 1;
    let recoveryData = {};
    let codeTimer = null;

    // PASSO 1: Enviar código
    this.querySelector("#btn-send-code").addEventListener("click", async () => {
      const email = emailInput.value.trim();
      const errorEl = this.querySelector("#forgot-email-error");

      if (!email) {
        errorEl.textContent = "Digite seu email";
        return;
      }

      if (!this.isValidEmail(email)) {
        errorEl.textContent = "Email inválido";
        return;
      }

      errorEl.textContent = "";
      
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
          errorEl.textContent = data.message || "Erro ao enviar código";
          return;
        }

        recoveryData = { email, token: data.token };
        this.goToStep(2);
        this.startCodeTimer();
      } catch (error) {
        errorEl.textContent = "Erro ao conectar com servidor";
      }
    });

    // PASSO 2: Verificar código
    this.querySelector("#btn-verify-code").addEventListener("click", async () => {
      const codigo = codeInput.value.trim();
      const errorEl = this.querySelector("#forgot-code-error");

      if (!codigo || codigo.length !== 6) {
        errorEl.textContent = "Digite um código válido";
        return;
      }

      errorEl.textContent = "";

      try {
        const response = await fetch("/api/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: recoveryData.email, codigo })
        });

        const data = await response.json();

        if (!response.ok) {
          errorEl.textContent = data.message || "Código inválido";
          return;
        }

        recoveryData = { ...recoveryData, recovery_id: data.recovery_id, id_usuario: data.id_usuario };
        this.goToStep(3);
        clearInterval(codeTimer);
      } catch (error) {
        errorEl.textContent = "Erro ao verificar código";
      }
    });

    // PASSO 3: Resetar senha
    this.querySelector("#btn-reset-password").addEventListener("click", async () => {
      const senha = passwordInput.value.trim();
      const senhaConfirm = passwordConfirmInput.value.trim();
      const errorEl = this.querySelector("#forgot-password-error");
      const errorConfirmEl = this.querySelector("#forgot-password-confirm-error");

      errorEl.textContent = "";
      errorConfirmEl.textContent = "";

      if (!senha) {
        errorEl.textContent = "Digite uma senha";
        return;
      }

      if (senha.length < 6) {
        errorEl.textContent = "Senha deve ter no mínimo 6 caracteres";
        return;
      }

      if (senha !== senhaConfirm) {
        errorConfirmEl.textContent = "As senhas não conferem";
        return;
      }

      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recovery_id: recoveryData.recovery_id,
            id_usuario: recoveryData.id_usuario,
            nova_senha: senha
          })
        });

        const data = await response.json();

        if (!response.ok) {
          errorEl.textContent = data.message || "Erro ao alterar senha";
          return;
        }

        this.goToStep(4); // Passo sucesso
      } catch (error) {
        errorEl.textContent = "Erro ao conectar com servidor";
      }
    });

    // Botões de navegação
    this.querySelector("#btn-cancel-forgot").addEventListener("click", () => this.closeDialog());
    this.querySelector("#btn-back-email").addEventListener("click", () => this.goToStep(1));
    this.querySelector("#btn-cancel-password").addEventListener("click", () => this.closeDialog());
    this.querySelector("#btn-close-success").addEventListener("click", () => this.closeDialog());

    // Fechar ao clicar fora
    this.dialog.addEventListener("click", (event) => {
      const rect = this.dialog.getBoundingClientRect();
      const isInDialog =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!isInDialog) this.closeDialog();
    });

    // Helper methods
    const goToStep = (step) => {
      document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
      document.querySelector(`.step-${step}`).classList.add("active");
      currentStep = step;
    };

    const startCodeTimer = () => {
      let remaining = 900; // 15 minutos
      const timerEl = this.querySelector("#code-timer");
      
      const updateTimer = () => {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        timerEl.textContent = `Código expira em ${minutes}:${String(seconds).padStart(2, "0")}`;
        
        if (remaining > 0) {
          remaining--;
          codeTimer = setTimeout(updateTimer, 1000);
        } else {
          timerEl.textContent = "Código expirado. Solicite um novo.";
          this.querySelector("#btn-verify-code").disabled = true;
        }
      };

      updateTimer();
    };

    this.goToStep = goToStep;
    this.startCodeTimer = startCodeTimer;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  openDialog() {
    this.dialog.showModal();
  }

  closeDialog() {
    // Reset para passo 1
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    document.querySelector(".step-1").classList.add("active");
    
    // Limpar campos
    this.querySelector("#forgot-email").value = "";
    this.querySelector("#forgot-code").value = "";
    this.querySelector("#forgot-password").value = "";
    this.querySelector("#forgot-password-confirm").value = "";
    
    // Limpar erros
    document.querySelectorAll(".error-message").forEach(e => e.textContent = "");
    
    this.dialog.close();
  }
}

customElements.define("dialog-forgot-password", ForgotPasswordDialog);
