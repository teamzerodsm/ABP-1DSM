const API_URL = '/api/usuarios';
const API_URL_EXAMES = '/api/exames';

function formatCpf(cpf) {
  const clean = String(cpf).replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}


async function preencherCertificado(usuario) {
  const nome = document.getElementById('nome');
  const cpf = document.getElementById('cpf');
  const email = document.getElementById('email');
  const dataEmissao = document.getElementById('dataEmissao');
  const mediaFinal = document.getElementById('mediaFinal');
  const certificadoId = document.getElementById('certificadoId');
  const listaNotas = document.getElementById('listaNotas');

  nome.textContent = (usuario.nome || '--').toLocaleUpperCase('pt-BR');
  cpf.textContent = formatCpf(usuario.cpf || '--');
  email.textContent = usuario.email || '--';
  dataEmissao.textContent = new Date().toLocaleDateString('pt-BR');
  mediaFinal.textContent = localStorage.getItem('mediaFinal') || '9,0';
  certificadoId.textContent = `SCRUM-${new Date().getFullYear()}-${String(usuario.id_usuario || 0).padStart(6, '0')}`;

  const dadoNivel = JSON.parse(localStorage.getItem('notasCertificado') || 'null') || [
    { nivel: 'Fundamentos Scrum'},
    { nivel: 'Scrum Master'},
    { nivel: 'Product Owner'},
    { nivel: 'Práticas Ágeis, Métricas e Qualidade'},
    { nivel: 'Aplicação Prática, Cenários e Análise Crítica'}
  ];

  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL_EXAMES}/historico`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(res.status)
  const dadoNota = await res.json();
  console.log(`HISTORICO DO USUARIO: ${dadoNota}`);

  listaNotas.innerHTML = '';
  dadoNivel.forEach(item => {
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
    preencherCertificado(usuario);
  } catch (error) {
    console.error('Erro ao carregar dados do usuário', error);
    localStorage.removeItem('token');
    window.location.href = '/index';
  }
}

// async function gerarPDF() {
//   const element = document.getElementById('certificateArea');
//   if (!element) {
//     return;
//   }

//   const rect = element.getBoundingClientRect();
//   const canvas = await html2canvas(element, {
//     scale: 3,
//     useCORS: true,
//     backgroundColor: '#ffffff',
//     width: rect.width,
//     height: rect.height,
//     windowWidth: document.documentElement.clientWidth,
//     windowHeight: document.documentElement.clientHeight,
//     scrollX: -window.scrollX,
//     scrollY: -window.scrollY
//   });

//   const imgData = canvas.toDataURL('image/png');
//   const { jsPDF } = window.jspdf || window.jspPDF || {};
//   const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();
//   const margin = 15;

//   const imgWidth = canvas.width;
//   const imgHeight = canvas.height;
//   const ratio = Math.min((pageWidth - margin * 2) / imgWidth, (pageHeight - margin * 2) / imgHeight);
//   const renderWidth = imgWidth * ratio;
//   const renderHeight = imgHeight * ratio;
//   const x = (pageWidth - renderWidth) / 2;
//   const y = (pageHeight - renderHeight) / 2;

//   pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
//   pdf.save('certificado-scrum.pdf');
// }

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
