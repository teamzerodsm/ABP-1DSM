async function verificarAcessoCertificado() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/index";
    return;
  }

  try {
    const [usuarioRes, historicoRes] = await Promise.all([
      fetch("/api/usuarios/me", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/exames/historico", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (!usuarioRes.ok) {
      localStorage.removeItem("token");
      window.location.href = "/index";
      return;
    }

    if (!historicoRes.ok) {
      window.location.href = "/certificado";
      return;
    }

    const historico = await historicoRes.json();
    const totalModulos = 5;
    const modulosConcluidos = historico.filter(
      (modulo) => modulo.tentativas && modulo.tentativas.length > 0
    ).length;

    if (modulosConcluidos < totalModulos) {
      mostrarDialogCertificadoIndisponivel(modulosConcluidos, totalModulos);
      return;
    }

    const notas = historico.map((modulo) => {
      if (!modulo.tentativas || modulo.tentativas.length === 0) return null;
      return Math.max(...modulo.tentativas.map((t) => Number(t.nota) || 0));
    });

    const notasValidas = notas.filter((nota) => nota !== null);
    const media = notasValidas.length > 0
      ? notasValidas.reduce((acc, nota) => acc + nota, 0) / notasValidas.length
      : 0;

    if (media < 6) {
      mostrarDialogCertificadoReprovado(media);
      return;
    }

    window.location.href = "/certificado";
  } catch (error) {
    console.error("Erro ao verificar acesso ao certificado", error);
    window.location.href = "/certificado";
  }
}

function criarDialogoCertificado(titulo, texto, detalhe, botaoTexto = "Continuar curso") {
  const dialog = document.createElement("dialog");
  dialog.className = "dialog";

  dialog.innerHTML = `
    <p class="dialog-title-cert">${titulo}</p>
    <p class="dialog-description">${texto}</p>


    ${detalhe ? `<div class="dialog-info-container"><p class="dialog-info">${detalhe}</p></div>` : ""}

    <div class="dialog-actions">
      <button class="btn-cancelar" id="headerDialogClose">Fechar</button>
      <a class="btn-prosseguir" href="/main">${botaoTexto}</a>
    </div>
  `;

  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!isInDialog) dialog.close();
  });

  dialog.addEventListener("close", () => dialog.remove());

  document.body.appendChild(dialog);
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.style.position = "fixed";
    dialog.style.top = "50%";
    dialog.style.left = "50%";
    dialog.style.transform = "translate(-50%, -50%)";
  }

  const closeButton = dialog.querySelector("#headerDialogClose");
  if (closeButton) closeButton.addEventListener("click", () => dialog.close());
}

function mostrarDialogCertificadoIndisponivel(concluidos, total) {
  criarDialogoCertificado(
    "Certificado indisponível",
    "Você precisa concluir todos os módulos do curso para emitir seu certificado.",
    `${concluidos} de ${total} módulos concluídos`,
    "Continuar curso"
  );
}

function mostrarDialogCertificadoReprovado(media) {
  criarDialogoCertificado(
    "Média insuficiente",
    `Sua média final foi ${media.toFixed(1).replace(".", ",")}. É necessário atingir pelo menos 6,0 para emitir o certificado.`,
    "Continue seus estudos e tente novamente.",
    "Continuar curso"
  );
}
