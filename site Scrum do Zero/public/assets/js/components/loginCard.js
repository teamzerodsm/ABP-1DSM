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
              <input class="form-input" name="CPF" data-required="Por favor, digite seu CPF" id="cpf-area" type="text" />
              <p id="cpf-error" class="error-message"></p>
            </div>
      
            <div class="form-group">
              <label for="password-area" class="form-label">Sua senha</label>
              <input class="form-input" name="password" data-required="Por favor, digite sua senha" id="password-area" type="password">
              <p id="password-error" class="error-message"></p>
              <a href="">Esqueci minha senha</a>
            </div>
      
            <button type="submit" class="login-button">Login</button>
            <p id="login-error" class="error-message"></p>
          </form>
      
          <div class="register-link">
             Não tem uma conta? <a href="cadastro.html">Cadastrar-se</a>
          </div>
        `

    this.inputCpf = this.querySelector("#cpf-area");
    this.inputPassword = this.querySelector("#password-area");
    this.loginError = this.querySelector("#login-error");
    this.allInputs = this.querySelectorAll(".form-input");
    this.formLogin = this.querySelector(".form-login");

    function showError(element, message) {
      const error = element.parentElement.querySelector(".error-message");

      error.classList.add("error-message");
      error.textContent = message;
    }

    const clearError = (element) => {
      const error = element.parentElement.querySelector(".error-message");

      element.classList.remove("error-message");
      error.textContent = "";
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
  }
}

customElements.define("default-logincard", loginCard);
