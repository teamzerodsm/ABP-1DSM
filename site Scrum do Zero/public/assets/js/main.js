    function openDialog(nivel, titulo, descricao, tentativasUsadas, totalTentativas, melhorPontuacao) {
      document.getElementById('dialog-label').textContent    = 'Nível ' + nivel;
      document.getElementById('dialog-title').textContent    = titulo;
      document.getElementById('dialog-desc').textContent     = '\u201c' + descricao + '\u201d';
      document.getElementById('dialog-tentativas').textContent = 'tentativas restantes: ' + tentativasUsadas + '/' + totalTentativas;
      document.getElementById('dialog-pontuacao').textContent  = 'melhor pontuação: ' + melhorPontuacao.toFixed(1);
      document.getElementById('overlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeDialog() {
      document.getElementById('overlay').classList.remove('active');
      document.body.style.overflow = '';
    }

    function handleOverlayClick(event) {
      // Fecha ao clicar fora da dialog
      if (event.target === document.getElementById('overlay')) {
        closeDialog();
      }
    }

    // Fecha com tecla ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeDialog();
    });

