document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm');
  const mensagem = document.getElementById('mensagem');
  const nome = document.getElementById('nome');
  const sobrenome = document.getElementById('sobrenome');
  const cpf = document.getElementById('cpf');
  const email = document.getElementById('email');
  const senha = document.getElementById('senha');
  const confirmar = document.getElementById('confirmar');

  const campos = [nome, sobrenome, cpf, email, senha, confirmar];
  const apiUrl = '/api/usuarios';

  const limparMensagem = () => {
    mensagem.textContent = '';
    mensagem.className = 'cadastro-mensagem';
    mensagem.style.display = 'none';
  };

  const mostrarMensagem = (texto, tipo) => {
    mensagem.textContent = texto;
    mensagem.className = `cadastro-mensagem ${tipo}`;
    mensagem.style.display = 'block';
  };

  const validarEmail = valor => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  const aplicarMascaraCPF = valor =>
    valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);

  cpf.addEventListener('input', () => {
    cpf.value = aplicarMascaraCPF(cpf.value);
  });

  campos.forEach(campo => campo.addEventListener('input', limparMensagem));

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const nomeVal = nome.value.trim();
    const sobrenomeVal = sobrenome.value.trim();
    const cpfVal = cpf.value.trim();
    const emailVal = email.value.trim();
    const senhaVal = senha.value;
    const confirmarVal = confirmar.value;

    const vazio = campos.find(campo => campo.value.trim() === '');
    if (vazio) {
      mostrarMensagem('Preencha todos os campos.', 'erro');
      vazio.focus();
      return;
    }

    if (cpfVal.replace(/\D/g, '').length !== 11) {
      mostrarMensagem('Digite um CPF válido com 11 números.', 'erro');
      cpf.focus();
      return;
    }

    if (!validarEmail(emailVal)) {
      mostrarMensagem('Digite um e-mail válido.', 'erro');
      email.focus();
      return;
    }

    if (senhaVal.length < 6) {
      mostrarMensagem('A senha deve ter pelo menos 6 caracteres.', 'erro');
      senha.focus();
      return;
    }

    if (senhaVal !== confirmarVal) {
      mostrarMensagem('As senhas não conferem.', 'erro');
      confirmar.focus();
      return;
    }

    try {
      const resposta = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: `${nomeVal} ${sobrenomeVal}`.trim(),
          email: emailVal,
          cpf: cpfVal,
          senha: senhaVal
        })
      });

      const data = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(data.message || 'Não foi possível concluir o cadastro.');
      }

      mostrarMensagem('Cadastro realizado com sucesso! Redirecionando para o login...', 'sucesso');
      form.reset();
      setTimeout(() => {
        window.location.href = './index.html';
      }, 1500);
    } catch (error) {
      mostrarMensagem(error.message || 'Erro ao conectar com o servidor.', 'erro');
    }
  });
});