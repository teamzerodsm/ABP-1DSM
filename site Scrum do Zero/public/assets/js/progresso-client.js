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

    const res = await fetch(API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) return window.location.href = "/index";
      const err = await res.json().catch(() => ({}));
      console.error("Erro ao carregar progresso:", err);
      return;
    }

    const modules = await res.json();
    renderTable(modules);
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
        if ((Number(attempt.respostas_respondidas) || 0) === 0) return `<td><span class="not-done">Não<br>respondida</span></td>`;
        const dateText = formatDate(attempt.data_exame || attempt.respondido_em || attempt.data_tentativa);
        return `<td><a href="#" class="link-date">${dateText.replace('\n', '<br>')}</a></td>`;
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
  document.addEventListener('DOMContentLoaded', fetchProgresso);
})();
