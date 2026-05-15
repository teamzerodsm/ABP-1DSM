// Monitora expiração do token e mostra mensagem antes de redirecionar para login

class TokenExpirationManager {
  constructor() {
    this.expirationTimeout = null;
    this.warningTimeout = null;
    this.warningTime = 5 * 1000; // Mostra aviso 5 segundos antes de expirar
    this.init();
  }

  // Decodifica o JWT para extrair informações
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // Calcula o tempo até expiração em milissegundos
  getTimeUntilExpiration(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return null;
    }

    const expirationTime = payload.exp * 1000;
    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;

    return timeUntilExpiration > 0 ? timeUntilExpiration : 0;
  }

  // Mostra mensagem de sessão expirada
  showExpirationMessage() {
    // Remove mensagem anterior se existir
    const existingMessage = document.getElementById('session-expired-overlay');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Cria overlay
    const overlay = document.createElement('div');
    overlay.id = 'session-expired-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    // Cria caixa de mensagem
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      max-width: 400px;
    `;

    messageBox.innerHTML = `
      <h2 style="color: #f44336; margin: 0 0 16px 0; font-size: 24px;">Sessão Expirada</h2>
      <p style="color: #666; margin: 0; font-size: 16px;">Sua sessão foi encerrada. Você será redirecionado para login.</p>
    `;

    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
  }

  // Faz logout automático e redireciona para login
  performAutoLogout() {
    localStorage.removeItem('token');
    window.location.href = '/index';
  }

  // Monitora a expiração do token
  monitorTokenExpiration() {
    if (this.expirationTimeout) {
      clearTimeout(this.expirationTimeout);
    }
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const timeUntilExpiration = this.getTimeUntilExpiration(token);
    if (timeUntilExpiration === null || timeUntilExpiration <= 0) {
      this.performAutoLogout();
      return;
    }

    // Define timeout para mostrar aviso (5 segundos antes de expirar)
    const warningTimeoutDuration = Math.max(timeUntilExpiration - this.warningTime, 0);
    this.warningTimeout = setTimeout(() => {
      this.showExpirationMessage();
    }, warningTimeoutDuration);

    // Define timeout para logout automático
    this.expirationTimeout = setTimeout(() => {
      this.performAutoLogout();
    }, timeUntilExpiration);
  }

  // Reinicia o monitoramento
  resetTimer() {
    this.monitorTokenExpiration();
  }

  // Inicializa o sistema
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.monitorTokenExpiration();

      // Monitora logout manual
      window.addEventListener('storage', (e) => {
        if (e.key === 'token') {
          if (e.newValue === null) {
            clearTimeout(this.expirationTimeout);
            clearTimeout(this.warningTimeout);
          } else {
            this.resetTimer();
          }
        }
      });
    });
  }
}

if (typeof window !== 'undefined') {
  window.tokenExpirationManager = new TokenExpirationManager();
}
