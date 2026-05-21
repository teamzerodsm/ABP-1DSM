const BASE_URL = "http://localhost:3000/api"

// Pega os elementos do HTML
const btnCadastro   = document.getElementById("btn-cadastro")
const inputNome     = document.getElementById("cad-nome")
const inputEmail    = document.getElementById("cad-email")
const inputCpf      = document.getElementById("cad-cpf")
const inputSenha    = document.getElementById("cad-senha")
const feedback      = document.getElementById("cad-feedback")

// Dispara ao clicar no botão
btnCadastro.addEventListener("click", fazerCadastro)

async function fazerCadastro() {
    const nome  = inputNome.value.trim()
    const email = inputEmail.value.trim()
    const cpf   = inputCpf.value.trim()
    const senha = inputSenha.value.trim()

    // Validações básicas no front antes de chamar a API
    if (!nome || !cpf || !senha) {
        return mostrarFeedback("Nome, CPF e senha são obrigatórios.", "error")
    }

    if (senha.length < 6) {
        return mostrarFeedback("A senha deve ter pelo menos 6 caracteres.", "error")
    }

    btnCadastro.disabled    = true
    btnCadastro.textContent = "Cadastrando..."

    try {
        // Faz o POST para /api/usuarios
        const response = await fetch(`${BASE_URL}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, cpf, senha })
        })

        const data = await response.json()

        if (!response.ok) {
            // Exibe a mensagem de erro que veio do backend
            return mostrarFeedback(data.message || "Erro ao cadastrar.", "error")
        }

        mostrarFeedback(`Conta criada com sucesso! Bem-vindo, ${data.nome}.`, "success")

        // Redireciona para o login após cadastro (ajuste o caminho se necessário)
        setTimeout(() => {
            window.location.href = "/pages/login.html"
        }, 1500)

    } catch (e) {
        // Erro de rede (servidor fora do ar, por exemplo)
        mostrarFeedback("Não foi possível conectar ao servidor.", "error")
    } finally {
        btnCadastro.disabled    = false
        btnCadastro.textContent = "Cadastrar"
    }
}

// Exibe mensagem de feedback na tela
function mostrarFeedback(mensagem, tipo) {
    feedback.textContent = mensagem
    feedback.className   = "feedback " + tipo // "error" ou "success"
}