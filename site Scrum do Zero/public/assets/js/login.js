const BASE_URL = "/api"
 
// Pega os elementos do HTML
const btnLogin    = document.getElementById("btn-login")
const inputCpf    = document.getElementById("login-cpf")
const inputSenha  = document.getElementById("login-senha")
const feedback    = document.getElementById("login-feedback")
 
// Dispara ao clicar no botão
btnLogin.addEventListener("click", fazerLogin)
 
async function fazerLogin() {
    const cpf   = inputCpf.value.trim()
    const senha = inputSenha.value.trim()
 
    // Validação básica no front antes de chamar a API
    if (!cpf || !senha) {
        return mostrarFeedback("Preencha o CPF e a senha.", "error")
    }
 
    btnLogin.disabled    = true
    btnLogin.textContent = "Entrando..."
 
    try {
        // Faz o POST para /api/auth/login
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf, senha })
        })
 
        const data = await response.json()
 
        if (!response.ok) {
            // Exibe a mensagem de erro que veio do backend
            return mostrarFeedback(data.message || "Erro ao fazer login.", "error")
        }
 
        // Salva o token no localStorage pra usar nas rotas protegidas
        localStorage.setItem("token", data.token)
        localStorage.setItem("nome", data.nome)
 
        mostrarFeedback(`Bem-vindo, ${data.nome}!`, "success")
 
        // Redireciona após login (ajuste o caminho conforme sua página principal)
        setTimeout(() => {
            window.location.href = "/pages/home.html"
        }, 1000)
 
    } catch (e) {
        // Erro de rede (servidor fora do ar, por exemplo)
        mostrarFeedback("Não foi possível conectar ao servidor.", "error")
    } finally {
        btnLogin.disabled    = false
        btnLogin.textContent = "Entrar"
    }
}
 
// Exibe mensagem de feedback na tela
function mostrarFeedback(mensagem, tipo) {
    feedback.textContent = mensagem
    feedback.className   = "feedback " + tipo // "error" ou "success"
}