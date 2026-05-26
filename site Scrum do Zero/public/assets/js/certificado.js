const API_URL = '/api/usuarios';

function formatCpf(cpf) {
  const clean = String(cpf).replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}


function preencherCertificado(usuario, progressData = []) {
  const nome = document.getElementById('nome');
  const cpf = document.getElementById('cpf');
  const email = document.getElementById('email');
  const dataEmissao = document.getElementById('dataEmissao');
  const mediaFinal = document.getElementById('mediaFinal');
  const certificadoId = document.getElementById('certificadoId');
  const listaNotas = document.getElementById('listaNotas');

  nome.textContent = (usuario.nome || '--').toUpperCase();
  cpf.textContent = formatCpf(usuario.cpf || '--');
  email.textContent = usuario.email || '--';
  dataEmissao.textContent = new Date().toLocaleDateString('pt-BR');
  certificadoId.textContent = `SCRUM-${new Date().getFullYear()}-${String(usuario.id_usuario || 0).padStart(6, '0')}`;

  const modulosMapping = [
    { id: 1, label: 'Fundamentos Scrum' },
    { id: 2, label: 'Scrum Master' },
    { id: 3, label: 'Product Owner' },
    { id: 4, label: 'Práticas Ágeis, Métricas e Qualidade' },
    { id: 5, label: 'Aplicação Prática, Cenários e Análise Crítica' }
  ];

  let sum = 0;
  let count = 0;
  const dadosNotas = modulosMapping.map(m => {
    const match = progressData.find(item => Number(item.id_modulo) === m.id);
    const completedAttempts = match
      ? match.tentativas.filter(t => Number(t.respostas_respondidas) > 0)
      : [];
    const best = completedAttempts.length
      ? Math.max(...completedAttempts.map(t => Number(t.nota)))
      : 0;

    sum += best;
    count++;

    return {
      nivel: m.label,
      nota: String(best.toFixed(1)).replace('.', ',')
    };
  });

  const media = count > 0 ? (sum / count).toFixed(1) : '0,0';
  mediaFinal.textContent = `${String(media).replace('.', ',')} / 10`;

  listaNotas.innerHTML = '';
  dadosNotas.forEach(item => {
    const card = document.createElement('div');
    card.className = 'note-item';
    card.innerHTML = `<strong>${item.nivel}</strong><span>${item.nota}</span>`;
    listaNotas.appendChild(card);
  });
}

async function carregarDados() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/index';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      window.location.href = '/index';
      return;
    }

    const usuario = await response.json();

    const progressResponse = await fetch("/api/progresso/tentativas", {
      headers: { Authorization: `Bearer ${token}` }
    });
    let progressData = [];
    if (progressResponse.ok) {
      progressData = await progressResponse.json();
    }

    const completedLevels = progressData.filter(m => 
      m.tentativas.some(t => Number(t.respostas_respondidas) > 0)
    ).length;

    let sumBest = 0;
    progressData.forEach(m => {
      const completedAttempts = m.tentativas.filter(t => Number(t.respostas_respondidas) > 0);
      const best = completedAttempts.length 
        ? Math.max(...completedAttempts.map(t => Number(t.nota))) 
        : 0;
      sumBest += best;
    });
    const media = completedLevels === 5 ? (sumBest / 5) : 0;

    if (completedLevels < 5 || media < 6.0) {
      alert("Você precisa concluir todos os 5 níveis com média geral igual ou superior a 6,0 para acessar seu certificado.");
      window.location.href = "/main";
      return;
    }

    preencherCertificado(usuario, progressData);
  } catch (error) {
    console.error('Erro ao carregar dados do usuário', error);
    localStorage.removeItem('token');
    window.location.href = '/index';
  }
}

async function gerarPDF() {
  const element = document.getElementById('certificateArea');
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0
  });

  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf || window.jspPDF || {};
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.max(pageWidth / imgWidth, pageHeight / imgHeight);

  const renderWidth = imgWidth * ratio;
  const renderHeight = imgHeight * ratio;
  const x = (pageWidth - renderWidth) / 2;
  const y = (pageHeight - renderHeight) / 2;

  pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
  pdf.save('certificado-scrum.pdf');
}

window.addEventListener('DOMContentLoaded', () => {
  carregarDados();

  const btnPdf = document.getElementById('btnPdf');
  if (btnPdf) {
    btnPdf.addEventListener('click', (event) => {
      event.preventDefault();
      gerarPDF();
    });
  }
});
