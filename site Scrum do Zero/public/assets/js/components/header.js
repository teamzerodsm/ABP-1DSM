class MeuCabecalho extends HTMLElement {
    connectedCallback() {

        this.classList.add('header');

        this.innerHTML = `
            <div class="div-header">
                <a href="/main"><img class="logo-img-header" src="assets/img/logo_scrumdozero.svg" alt="Logo Scrum Zero"/></a>

                <nav class="nav-links" id="navLinks">
                    <a href="/main">Níveis</a>
                    <a href="/progresso">Histórico</a>
                    <a href="/perfil">Perfil</a>
                    <a href="/certificado">Certificado</a>
                    <a href="#" id="btnLogout">Sair</a>
                </nav>

                <div class="menu-icon" id="menuIcon">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        const navLinks = this.querySelector('#navLinks');
        const menuIcon = this.querySelector('#menuIcon');

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

        const checkCertificado = () => {
            const token = localStorage.getItem("token");
            const concluidos = Number(localStorage.getItem("niveisConcluidos")) || 0;
            const media = Number(localStorage.getItem("mediaFinal")) || 0;

            const linkCertificado = this.querySelector('a[href="/certificado"]');
            if (linkCertificado) {
                if (!token || concluidos < 5 || media < 6.0) {
                    linkCertificado.removeAttribute("href");
                    linkCertificado.style.opacity = "0.45";
                    linkCertificado.style.pointerEvents = "none";
                    linkCertificado.style.cursor = "not-allowed";
                } else {
                    linkCertificado.setAttribute("href", "/certificado");
                    linkCertificado.style.opacity = "1";
                    linkCertificado.style.pointerEvents = "auto";
                    linkCertificado.style.cursor = "pointer";
                }
            }
        };

        checkCertificado();
        window.addEventListener('progressUpdated', checkCertificado);
    }
}

customElements.define('default-header', MeuCabecalho);
