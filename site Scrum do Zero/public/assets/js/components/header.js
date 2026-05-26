class MeuCabecalho extends HTMLElement {
  connectedCallback() {
    this.classList.add("header");

    this.innerHTML = `
            <div class="div-header">
                <a href="/main"><img class="logo-img-header" src="assets/img/logo_scrumdozero.svg" alt="Logo Scrum Zero"/></a>

 <nav class="nav-links" id="navLinks">
  <a href="/progresso">Histórico</a>
  <a href="/perfil">Perfil</a>

  <span class="certificado-wrapper bloqueado" data-tooltip="Finalize os módulos para emitir o certificado">
    <a href="/certificado" id="btnCertificado" class="link-certificado" aria-disabled="true">
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

    menuIcon.addEventListener("click", () => {
      menuIcon.classList.toggle("ativo");
      navLinks.classList.toggle("aberto");
    });
  }
}

customElements.define("default-header", MeuCabecalho);
function verificarLiberacaoCertificado() {
  const totalNiveis = 5;

  const niveisConcluidosEl = document.getElementById("niveis-concluidos");
  const wrapperCertificado = document.querySelector(".certificado-wrapper");
  const botaoCertificado = document.getElementById("btnCertificado");

  if (!wrapperCertificado || !botaoCertificado) return;

  let niveisConcluidos = 0;

  if (niveisConcluidosEl) {
    const textoNiveis = niveisConcluidosEl.textContent.trim();
    niveisConcluidos = parseInt(textoNiveis, 10);
  }

  if (isNaN(niveisConcluidos) || niveisConcluidos < 0) {
    niveisConcluidos = Number(localStorage.getItem("niveisConcluidos")) || 0;
  }

  if (niveisConcluidos >= totalNiveis) {
    wrapperCertificado.classList.remove("bloqueado");
    botaoCertificado.removeAttribute("aria-disabled");
    botaoCertificado.style.pointerEvents = "auto";
    botaoCertificado.style.opacity = "1";
  } else {
    wrapperCertificado.classList.add("bloqueado");
    botaoCertificado.setAttribute("aria-disabled", "true");
    botaoCertificado.style.pointerEvents = "none";
    botaoCertificado.style.opacity = "0.45";
  }
}

document.addEventListener("DOMContentLoaded", verificarLiberacaoCertificado);
document.addEventListener("progressUpdated", verificarLiberacaoCertificado);