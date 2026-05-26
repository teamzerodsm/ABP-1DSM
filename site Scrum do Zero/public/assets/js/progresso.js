const mysql = require('mysql2');

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = connection.promise();

function salvarNiveisConcluidos() {
  const elementoNiveis = document.getElementById("niveis-concluidos");
  if (!elementoNiveis) return;

  const texto = elementoNiveis.textContent.trim();
  const niveisConcluidos = parseInt(texto, 10);

  if (!isNaN(niveisConcluidos)) {
    localStorage.setItem("niveisConcluidos", niveisConcluidos);
  } else {
    localStorage.setItem("niveisConcluidos", 0);
  }

  atualizarEstadoCertificado();
}

document.addEventListener("DOMContentLoaded", function () {
  salvarNiveisConcluidos();
});

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