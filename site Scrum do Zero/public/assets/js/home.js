const btnAcessar = document.getElementById('access-btn')
const mobileCardSec = document.getElementById('login-card-sec') 

const apiUrl = 'api/auth/login';

function hidden(){
    mobileCardSec.classList.remove('hidden')
}

btnAcessar.addEventListener('click', ()=>{
    hidden()
})

function atualizarEstadoCertificado() {
  const totalNiveis = 5;
  const wrapperCertificado = document.querySelector(".certificado-wrapper");
  const botaoCertificado = document.getElementById("btnCertificado");

  if (!wrapperCertificado || !botaoCertificado) return;

  const niveisConcluidos = Number(localStorage.getItem("niveisConcluidos")) || 0;

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

document.addEventListener("DOMContentLoaded", atualizarEstadoCertificado);