const API_URL = '/api/usuarios';
const API_URL_EXAMES = '/api/exames';

// Total de questões por módulo (para converter acertos em nota 0–10)
const QUESTOES_POR_MODULO = 10;

function formatCpf(cpf) {
  const clean = String(cpf).replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Nomes fixos dos módulos na ordem esperada (id_modulo 1–5)
const MODULOS_LABEL = {
  1: 'Fundamentos Scrum',
  2: 'Scrum Master',
  3: 'Product Owner',
  4: 'Práticas Ágeis, Métricas e Qualidade',
  5: 'Aplicação Prática, Cenários e Análise Crítica',
};

function melhorNota(tentativas) {
  if (!tentativas || tentativas.length === 0) return null;
  // nota vem como acertos (0–10), já é a soma de notas individuais
  const max = Math.max(...tentativas.map(t => Number(t.nota) || 0));
  return max;
}

function formatarNota(nota) {
  if (nota === null) return '--';
  // nota já está em escala 0–10 (cada questão vale 1 ponto)
  return nota.toFixed(1).replace('.', ',');
}

async function preencherCertificado(usuario) {
  const nome        = document.getElementById('nome');
  const cpf         = document.getElementById('cpf');
  const email       = document.getElementById('email');
  const dataEmissao = document.getElementById('dataEmissao');
  const mediaFinal  = document.getElementById('mediaFinal');
  const certificadoId = document.getElementById('certificadoId');
  const listaNotas  = document.getElementById('listaNotas');

  // Dados do usuário
  nome.textContent        = (usuario.nome || '--').toLocaleUpperCase('pt-BR');
  cpf.textContent         = formatCpf(usuario.cpf || '--');
  email.textContent       = usuario.email || '--';
  dataEmissao.textContent = new Date().toLocaleDateString('pt-BR');
  certificadoId.textContent = `SCRUM-${new Date().getFullYear()}-${String(usuario.id_usuario || 0).padStart(6, '0')}`;

  // Buscar histórico real
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL_EXAMES}/historico`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    mostrarIndisponivel();
    return;
  }

  const historico = await res.json();
  const historicoMap = new Map(historico.map(m => [m.id_modulo, m]));

  const totalModulos = Object.keys(MODULOS_LABEL).length;
  const modulosConcluidos = Object.keys(MODULOS_LABEL).filter(idStr => {
    const moduloData = historicoMap.get(Number(idStr));
    return moduloData && moduloData.tentativas.length > 0;
  }).length;

  if (modulosConcluidos < totalModulos) {
    mostrarIndisponivel(modulosConcluidos, totalModulos);
    return;
  }

  listaNotas.innerHTML = '';
  const notasPorModulo = [];

  Object.entries(MODULOS_LABEL).forEach(([idStr, label]) => {
    const idModulo = Number(idStr);
    const moduloData = historicoMap.get(idModulo);
    const nota = moduloData ? melhorNota(moduloData.tentativas) : null;
    notasPorModulo.push(nota);

    const card = document.createElement('div');
    card.className = 'note-item';
    card.innerHTML = `<strong>${label}</strong><span>${formatarNota(nota)}</span>`;
    listaNotas.appendChild(card);
  });

  // Média final apenas dos módulos concluídos
  const notasValidas = notasPorModulo.filter(n => n !== null);
  if (notasValidas.length > 0) {
    const media = notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
    mediaFinal.textContent = formatarNota(media);
  } else {
    mediaFinal.textContent = '--';
  }
}

async function carregarDados() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/index';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      window.location.href = '/index';
      return;
    }

    const usuario = await response.json();
    await preencherCertificado(usuario);
  } catch (error) {
    console.error('Erro ao carregar dados do usuário', error);
    localStorage.removeItem('token');
    window.location.href = '/index';
  }
}

function mostrarIndisponivel(concluidos = 0, total = 5) {
  const shell = document.querySelector('.certificate-shell');
  const topbar = document.querySelector('.topbar');

  if (topbar) topbar.style.display = 'none';

  shell.innerHTML = `
    <div class="unavailable">
      <div class="unavailable-icon">🎓</div>
      <h2>Certificado indisponível</h2>
      <p>Você precisa concluir todos os módulos do curso para emitir seu certificado.</p>
      <div class="unavailable-progress">
        <span>${concluidos} de ${total} módulos concluídos</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(concluidos / total) * 100}%"></div>
        </div>
      </div>
      <a href="/main" class="btn-primary">Continuar curso</a>
    </div>
  `;
}

async function gerarPDF() {
  const element = document.getElementById('certificateArea');
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
  });

  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf || window.jspPDF || {};
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const ratio      = Math.max(pageWidth / canvas.width, pageHeight / canvas.height);

  pdf.addImage(
    imgData, 'PNG',
    (pageWidth  - canvas.width  * ratio) / 2,
    (pageHeight - canvas.height * ratio) / 2,
    canvas.width  * ratio,
    canvas.height * ratio,
    undefined, 'FAST'
  );

  pdf.save('certificado-scrum.pdf');
}

window.addEventListener('DOMContentLoaded', () => {
  carregarDados();

  const btnPdf = document.getElementById('btnPdf');
  if (btnPdf) {
    btnPdf.addEventListener('click', (e) => {
      e.preventDefault();
      gerarPDF();
    });
  }
});