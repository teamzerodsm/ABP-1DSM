// Script de proteção de páginas - redireciona para login se não estiver autenticado
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  
  // Lista de páginas que requerem autenticação
  const paginasProtegidas = ['/main', '/perfil', '/progresso', '/quiz-page', '/certificado'];
  
  // Obtém a página atual
  const paginaAtual = window.location.pathname;
  
  // Verifica se a página atual é protegida
  const estaProtegida = paginasProtegidas.some(pagina => paginaAtual.includes(pagina));
  
  // Se está em uma página protegida e não tem token, redireciona para index
  if (estaProtegida && !token) {
    window.location.href = '/index';
  }
});
