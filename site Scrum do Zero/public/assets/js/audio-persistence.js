// Sistema simples de persistência de áudio
(function() {
  // Objeto global que persiste enquanto a aba está aberta
  if (!window.persistentAudio) {
    window.persistentAudio = {
      element: new Audio('https://live.hunter.fm/lofi_stream?ag=mp3'),
      isPlaying: false
    };
    
    window.persistentAudio.element.preload = 'auto';
    window.persistentAudio.element.crossOrigin = 'anonymous';
  }

  const audio = window.persistentAudio.element;

  // API global de controle
  window.audioManager = {
    play() {
      audio.play().catch(err => console.error('Erro ao tocar:', err));
      window.persistentAudio.isPlaying = true;
      localStorage.setItem('audioState', 'playing');
      window.dispatchEvent(new CustomEvent('audioStateChanged', {
        detail: { isPlaying: true }
      }));
    },

    pause() {
      audio.pause();
      window.persistentAudio.isPlaying = false;
      localStorage.setItem('audioState', 'paused');
      window.dispatchEvent(new CustomEvent('audioStateChanged', {
        detail: { isPlaying: false }
      }));
    },

    toggle() {
      if (window.persistentAudio.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    },

    isPlaying() {
      return window.persistentAudio.isPlaying;
    }
  };

  // Listeners do áudio
  audio.addEventListener('play', () => {
    window.persistentAudio.isPlaying = true;
    localStorage.setItem('audioState', 'playing');
    window.dispatchEvent(new CustomEvent('audioStateChanged', {
      detail: { isPlaying: true }
    }));
  });

  audio.addEventListener('pause', () => {
    window.persistentAudio.isPlaying = false;
    localStorage.setItem('audioState', 'paused');
    window.dispatchEvent(new CustomEvent('audioStateChanged', {
      detail: { isPlaying: false }
    }));
  });

  // Restaura o estado quando a página carrega
  function restoreState() {
    const wasPlaying = localStorage.getItem('audioState') === 'playing';
    if (wasPlaying && audio.paused) {
      setTimeout(() => {
        audio.play().catch(err => console.error('Erro ao retomar:', err));
        window.persistentAudio.isPlaying = true;
      }, 100);
    }
  }

  // Inicia quando pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreState);
  } else {
    restoreState();
  }
})();
