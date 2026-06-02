class MeuCabecalho extends HTMLElement {
  connectedCallback() {
    this.classList.add("header");

    this.innerHTML = `
            <div class="div-header">
                <a href="/main" class="btn-with-tooltip" data-tooltip="Página Inicial"><img class="logo-img-header" src="assets/img/logo_scrumdozero.svg" alt="Logo Scrum Zero"/></a>

                <nav class="nav-links" id="navLinks">
                    <a href="/progresso" class="btn-with-tooltip" data-tooltip="Ver seu histórico de progresso">Histórico</a>
                    <a href="/perfil" class="btn-with-tooltip" data-tooltip="Acessar seu perfil">Perfil</a>
                    <span class="certificado-wrapper">
                        <a href="/certificado" id="btnCertificado" class="link-certificado btn-with-tooltip" data-tooltip="Gerar seu certificado">Certificado</a>
                    </span>
                    <a href="#" id="logoutLink" class="btn-with-tooltip" data-tooltip="Sair da conta"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-right-exit-icon lucide-square-arrow-right-exit"><path d="M10 12h11"/><path d="m17 16 4-4-4-4"/><path d="M21 6.344V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.344"/></svg></a>
                </nav>

                <div class="menu-icon" id="menuIcon">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

    const navLinks = this.querySelector("#navLinks");
    const menuIcon = this.querySelector("#menuIcon");
    const botaoCertificado = this.querySelector("#btnCertificado");

    const logoutLink = this.querySelector('#logoutLink');
    if (logoutLink) {
      logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          // ignore network errors and continue with local logout
        }
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        window.location.href = '/index';
      });
    }

    menuIcon.addEventListener('click', () => {
      menuIcon.classList.toggle('ativo');
      navLinks.classList.toggle('aberto');
    });

    const btnLogout = this.querySelector('#btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("niveisConcluidos");
        localStorage.removeItem("mediaFinal");
        window.location.href = "/index";
      });
    }

    if (botaoCertificado) {
      botaoCertificado.addEventListener("click", async (event) => {
        event.preventDefault();
        await verificarAcessoCertificado();
      });
    }

  }
}

customElements.define("default-header", MeuCabecalho);
