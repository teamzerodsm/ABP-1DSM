// Singleton global para o áudio
if (!window.globalAudioPlayer) {
  window.globalAudioPlayer = {
    isPlaying: false,
    buttons: []
  };
}

class AudioPlayer extends HTMLElement {
  connectedCallback() {
    this.classList.add("audio-player");

    // Verifica o estado inicial
    const isPlaying = window.audioManager?.isPlaying?.() || false;

    this.innerHTML = `
      <button 
        type="button" 
        id="btnAudio" 
        class="btn-audio btn-with-tooltip ${isPlaying ? 'tocando' : 'mutado'}" 
        data-tooltip="Tocar/Mutar Rádio Scrum"
        aria-label="Controle de áudio - Rádio Scrum"
      >
       <svg class="icon-speaker-on" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2-icon lucide-volume-2">
        <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
        <path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>
        <svg class="icon-speaker-muted" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-off-icon lucide-volume-off">
        <path d="M16 9a5 5 0 0 1 .95 2.293"/><path d="M19.364 5.636a9 9 0 0 1 1.889 9.96"/><path d="m2 2 20 20"/><path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"/>
        <path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686"/></svg>
      </button>
    `;

    const btnAudio = this.querySelector("#btnAudio");
    window.globalAudioPlayer.buttons.push(btnAudio);

    btnAudio.addEventListener("click", () => {
      if (window.audioManager) {
        window.audioManager.toggle();
      }
    });

    // Escuta mudanças no estado do áudio
    window.addEventListener('audioStateChanged', (e) => {
      this.updateAllButtons(e.detail.isPlaying);
    });
  }

  updateAllButtons(isPlaying) {
    window.globalAudioPlayer.isPlaying = isPlaying;
    window.globalAudioPlayer.buttons.forEach(btn => {
      if (isPlaying) {
        btn.classList.remove("mutado");
        btn.classList.add("tocando");
      } else {
        btn.classList.remove("tocando");
        btn.classList.add("mutado");
      }
    });
  }

  disconnectedCallback() {
    const btn = this.querySelector("#btnAudio");
    if (btn) {
      const index = window.globalAudioPlayer.buttons.indexOf(btn);
      if (index > -1) {
        window.globalAudioPlayer.buttons.splice(index, 1);
      }
    }
  }
}

customElements.define("audio-player", AudioPlayer);
