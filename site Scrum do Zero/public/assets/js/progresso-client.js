// Cliente para buscar e renderizar histórico de progresso
(function () {
  const API = "/api/progresso/tentativas";

  function formatDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + "\n" + d.toLocaleTimeString();
    } catch (e) {
      return iso;
    }
  }

  async function fetchProgresso() {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "/index";
    console.debug("[progresso-client] token present:", !!token);

    const res = await fetch(API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) return window.location.href = "/index";
      const err = await res.json().catch(() => ({}));
      console.error("Erro ao carregar progresso:", err);
      alert(err.message || "Não foi possível carregar o histórico de progresso.");
      return;
    }

    const modules = await res.json();
    renderTable(modules);
    renderStats(modules);
    window.dispatchEvent(new Event('progressUpdated'));
  }

  function renderStats(modulos) {
    // Um nível é concluído se possuir pelo menos uma tentativa com respostas respondidas > 0
    const completedLevels = modulos.filter(m => 
      m.tentativas.some(t => Number(t.respostas_respondidas) > 0)
    ).length;

    // Total de tentativas registradas
    const totalAttempts = modulos.reduce((sum, m) => sum + m.tentativas.length, 0);

    // Média geral considerando apenas tentativas finalizadas (respostas > 0)
    const completedAttempts = modulos.flatMap(m => m.tentativas)
      .filter(t => Number(t.respostas_respondidas) > 0);
    const average = completedAttempts.length 
      ? (completedAttempts.reduce((sum, t) => sum + Number(t.nota), 0) / completedAttempts.length).toFixed(1)
      : "0,0";

    const concluidosEl = document.getElementById("niveis-concluidos");
    const registradasEl = document.getElementById("tentativas-registradas");
    const mediaEl = document.getElementById("media-geral");

    if (concluidosEl) concluidosEl.textContent = completedLevels;
    if (registradasEl) registradasEl.textContent = totalAttempts;
    if (mediaEl) mediaEl.textContent = `${String(average).replace('.', ',')} / 10`;

    localStorage.setItem("niveisConcluidos", completedLevels);
  }

  function renderTable(modulos) {
    const tbody = document.querySelector('.progress-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    modulos.forEach((m) => {
      const best = m.tentativas.length ? Math.max(...m.tentativas.map(t => Number(t.nota))) : null;

      const getAttemptCell = (attemptNumber) => {
        const attempt = m.tentativas.find(t => Number(t.tentativa) === attemptNumber);
        if (!attempt) return `<td><span class="not-done">Não<br>realizada</span></td>`;
        const isInProgress = (Number(attempt.respostas_respondidas) || 0) === 0;
        const href = isInProgress
          ? `/quiz-page.html?modulo=${m.id_modulo}`
          : `/quiz-page.html?review=true&id_exame=${attempt.id_exame}&modulo=${m.id_modulo}`;
        const label = isInProgress
          ? "Continuar"
          : formatDate(attempt.data_exame || attempt.respondido_em || attempt.data_tentativa).replace('\n', '<br>');
        return `<td><a href="${href}" class="link-date">${label}</a></td>`;
      };

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="col-nivel">${m.modulo}</td>
        <td class="col-nota">${best !== null ? best : '-'}</td>
        ${getAttemptCell(1)}
        ${getAttemptCell(2)}
      `;

      tbody.appendChild(row);
    });
  }

  // inicia quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', () => {
    fetchProgresso();
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const dialogEl = document.querySelector('dialog-quiz');
        if (dialogEl && dialogEl.dialog) {
          dialogEl.dialog.showModal();
        }
      });
    }
  });
})();
