/**
 * Valida um CPF de acordo com as regras do algoritmo de verificação brasileiro
 * Uso: validarCpf("12345678901") ou validarCpf("123.456.789-01")
 * @param {string} cpf - CPF a ser validado (com ou sem máscara)
 * @returns {boolean} - true se o CPF é válido, false caso contrário
 */
function validarCpf(cpf) {
    // Remove tudo que não é número
    const cpfLimpo = cpf.toString().replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
        return false;
    }

    // Verifica se não é uma sequência de números repetidos
    const sequenciaIgual = /^(\d)\1{10}$/.test(cpfLimpo);
    if (sequenciaIgual) {
        return false;
    }

    // Calcula o primeiro dígito verificador
    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
        return false;
    }

    // Calcula o segundo dígito verificador
    soma = 0;

    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
        return false;
    }

    return true;
}
