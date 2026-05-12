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
              <input class="form-input" name="password" data-required="Por favor, digite sua senha" id="password-area" type="password" >
              <p id="password-error" class="error-message"></p>
              <a href="">Esqueci minha senha</a>
            </div>
      
            <button type="submit" class="login-button">Login</button>
          </form>
      
          <div class="register-link">
             Não tem uma conta? <a href="cadastro.html">Cadastrar-se</a>
          </div>
        `

    this.inputCpf = this.querySelector("#cpf-area");
    this.inputPassword = this.querySelector("#password-area");
    this.allInputs = this.querySelectorAll(".form-input");
    this.formLogin = this.querySelector(".form-login");

    function showError(element, message) {
      const error = element.parentElement.querySelector(".error-message");

      error.classList.add("error-message");
      error.textContent = message;
    }

    function clearError(element) {
      const error = element.parentElement.querySelector(".error-message");

      element.classList.remove("error-message");
      error.textContent = "";
    }

    this.formLogin.addEventListener("submit", (event) => {
      this.allInputs.forEach((input) => {
        if (!input.value.trim()) {
          event.preventDefault();
          showError(input, input.dataset.required);
        } else {
          clearError(input);
        }
      });
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
