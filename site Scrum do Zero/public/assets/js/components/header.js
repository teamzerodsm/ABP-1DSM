class MeuCabecalho extends HTMLElement {
  connectedCallback() {
    this.classList.add("header");

    this.innerHTML = `
            <div class="div-header">
                <a href="/main"><img class="logo-img-header" src="assets/img/logo_scrumdozero.svg" alt="Logo Scrum Zero"/></a>

 <nav class="nav-links" id="navLinks">
  <a href="/progresso">Histórico</a>
  <a href="/perfil">Perfil</a>

  <span class="certificado-wrapper">
    <a href="/certificado" id="btnCertificado" class="link-certificado">
      Certificado
    </a>
  </span>
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

    menuIcon.addEventListener("click", () => {
      menuIcon.classList.toggle("ativo");
      navLinks.classList.toggle("aberto");
    });

    if (botaoCertificado) {
      botaoCertificado.addEventListener("click", async (event) => {
        event.preventDefault();
        await verificarAcessoCertificado();
      });
    }
  }
}

customElements.define("default-header", MeuCabecalho);
