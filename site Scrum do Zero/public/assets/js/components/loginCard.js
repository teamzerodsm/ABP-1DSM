class loginCard extends HTMLElement {
  connectedCallback() {
    this.classList.add("login-card");

    this.innerHTML = `
          <div class="login-header">
            <h3>Bem vindo!</h3>
            <p>Faça login para continuar sua jornada</p>
          </div>
      
          <form class="form-login">
            <div class="form-group">
              <label for="cpf-area" class="form-label">Seu CPF</label>
              <div class="input-box">
                <input class="main-input form-input" name="cpf-area" data-required="Por favor, digite seu CPF" id="cpf-area" type="text" aria-describedby="cpf-error"/>
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-id-card-icon lucide-id-card"><path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
              </div>
              <p id="cpf-error" class="error-message"></p>
            </div>
      
            <div class="form-group">
              <label for="password-area" class="form-label">Sua senha</label>
              <div class="input-box">
                <div class="password-input-container">
                  <input class="main-input form-input" name="password-area" id="password-area" type="password" data-required="Por favor, digite sua senha" aria-describedby="password-error">
                  <img src="assets/img/showPassword.png" class="lnr lnr-eye"/>
                  <p id="password-error" class="error-message error-message-2"></p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="31" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              </div>
              <a href="" class="forgot-password">Esqueci minha senha</a>
            </div>
      
            <button type="submit" class="primary-btn login-button">Login</button>
            <p id="login-error" class="error-message"></p>
          </form>
      
          <div class="register-link"> 
            <p>Não tem uma conta?</p> 
            <a href="cadastro.html">Cadastrar-se</a>
          </div>
        `

    this.inputCpf = this.querySelector("#cpf-area");
    this.inputPassword = this.querySelector("#password-area");
    this.loginError = this.querySelector("#login-error");
    this.allInputs = this.querySelectorAll(".form-input");
    this.formLogin = this.querySelector(".form-login");
    this.eyeBtn = this.querySelector(".lnr-eye");
    this.forgotPasswordLink = this.querySelector(".forgot-password");

    function showError(element, message) {
      const formGroup = element.closest('.form-group') || element.parentElement;
      const error = formGroup ? formGroup.querySelector(".error-message") : null;
      if (!error) return;

      error.textContent = message;
    }

    const clearError = (element) => {
      const formGroup = element.closest('.form-group') || element.parentElement;
      const error = formGroup ? formGroup.querySelector(".error-message") : null;

      if (error) error.textContent = "";
      if (element === this.inputCpf || element === this.inputPassword) {
        this.loginError.textContent = "";
      }
    }

    const loginUrl = "/api/auth/login";

    this.formLogin.addEventListener("submit", async (event) => {
      event.preventDefault();
      let hasError = false;
      this.loginError.textContent = "";

      this.allInputs.forEach((input) => {
        if (!input.value.trim()) {
          showError(input, input.dataset.required);
          hasError = true;
        } else {
          clearError(input);
        }
      });

      const cpfValue = this.inputCpf.value.replace(/\D/g, "").trim();
      const passwordValue = this.inputPassword.value.trim();

      if (!hasError && cpfValue.length !== 11) {
        showError(this.inputCpf, "Digite um CPF válido com 11 números.");
        hasError = true;
      }

      if (hasError) {
        return;
      }

      try {
        const response = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ cpf: cpfValue, senha: passwordValue })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          this.loginError.textContent = data.message || "CPF ou senha inválidos.";
          return;
        }

        localStorage.setItem("token", data.token);
        window.location.href = "/main";
      } catch (error) {
        this.loginError.textContent = "Erro ao conectar com o servidor.";
      }
    });

    this.allInputs.forEach((input) => {
      input.addEventListener("input", () => {
        if (input.value.trim() != null) {
          clearError(input);
        }
      });
    });

    this.eyeBtn.addEventListener("click", () => {
      if (this.inputPassword.getAttribute("type") == "password") {
        this.inputPassword.setAttribute("type", "text");
        this.eyeBtn.setAttribute("src","assets/img/hidePassword.png")
      } else {
        this.inputPassword.setAttribute("type", "password");
        this.eyeBtn.setAttribute("src","assets/img/showPassword.png")
      }
    });

    // Integrar com dialog de recuperação de senha
    if (this.forgotPasswordLink) {
      this.forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        const dialogForgotPassword = document.querySelector("dialog-forgot-password");
        if (dialogForgotPassword && dialogForgotPassword.openDialog) {
          dialogForgotPassword.openDialog();
        }
      });
    }
  }
}

customElements.define("default-logincard", loginCard);
