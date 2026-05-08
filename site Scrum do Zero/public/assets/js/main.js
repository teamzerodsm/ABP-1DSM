// =============================================
// ELEMENTOS
// =============================================
const hamburger       = document.getElementById('hamburger');
const sidebar         = document.getElementById('sidebar');
const sidebarOverlay  = document.getElementById('sidebar-overlay');
const overlay         = document.getElementById('overlay');

// =============================================
// SIDEBAR — Menu lateral (mobile)
// =============================================
function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
  sidebar.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Fechar menu');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  sidebar.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Abrir menu');
  // Só libera scroll se a dialog também estiver fechada
  if (!overlay.classList.contains('active')) {
    document.body.style.overflow = '';
  }
}

hamburger.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});

sidebarOverlay.addEventListener('click', closeSidebar);

// =============================================
// DIALOG — Seleção de nível
// =============================================
function openDialog(nivel, titulo, descricao, tentativasUsadas, totalTentativas, melhorPontuacao) {
  document.getElementById('dialog-label').textContent      = 'Nível ' + nivel;
  document.getElementById('dialog-title').textContent      = titulo;
  document.getElementById('dialog-desc').textContent       = '\u201c' + descricao + '\u201d';
  document.getElementById('dialog-tentativas').textContent = 'tentativas restantes: ' + tentativasUsadas + '/' + totalTentativas;
  document.getElementById('dialog-pontuacao').textContent  = 'melhor pontuação: ' + melhorPontuacao.toFixed(1);
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDialog() {
  overlay.classList.remove('active');
  // Só libera scroll se a sidebar também estiver fechada
  if (!sidebar.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

function handleOverlayClick(event) {
  if (event.target === overlay) {
    closeDialog();
  }
}

// =============================================
// ESC — Fecha sidebar e/ou dialog
// =============================================
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (overlay.classList.contains('active'))  closeDialog();
    if (sidebar.classList.contains('open'))    closeSidebar();
  }
});
