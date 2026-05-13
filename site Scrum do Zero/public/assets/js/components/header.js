class MeuCabecalho extends HTMLElement {
    connectedCallback() {

        this.classList.add('header');

        this.innerHTML = `
            <div class="div-header">
                <a href="/main"><img class="logo-img" src="" alt="Logo Scrum Zero"/></a>

                <nav class="nav-links" id="navLinks">
                    <a href="/progresso">Histórico</a>
                    <a href="/perfil">Perfil</a>
                    <a href="/certificado">Certificado</a>
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
    }
}

customElements.define('default-header', MeuCabecalho);
