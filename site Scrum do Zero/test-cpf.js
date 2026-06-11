// Teste da validação de CPF
function validarCpf(cpf) {
    const cpfLimpo = cpf.toString().replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
        return false;
    }

    const sequenciaIgual = /^(\d)\1{10}$/.test(cpfLimpo);
    if (sequenciaIgual) {
        return false;
    }

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

// Testes
console.log("=== TESTES DE VALIDAÇÃO DE CPF ===\n");

const testes = [
    { cpf: "00000000000", esperado: false, descricao: "Sequência repetida (zeros)" },
    { cpf: "11111111111", esperado: false, descricao: "Sequência repetida (uns)" },
    { cpf: "12345678901", esperado: false, descricao: "CPF fictício inválido" },
    { cpf: "1234567890", esperado: false, descricao: "Menos de 11 dígitos" },
    { cpf: "", esperado: false, descricao: "CPF vazio" },
    { cpf: "11144477735", esperado: true, descricao: "CPF válido de teste" },
    { cpf: "111.444.777-35", esperado: true, descricao: "CPF válido com máscara" },
    { cpf: "123.456.789-09", esperado: true, descricao: "CPF válido com máscara (outro)" }
];

let passaram = 0;
let falharam = 0;

testes.forEach(teste => {
    const resultado = validarCpf(teste.cpf);
    const status = resultado === teste.esperado ? "✓ PASSOU" : "✗ FALHOU";
    
    if (resultado === teste.esperado) {
        passaram++;
    } else {
        falharam++;
    }
    
    console.log(`${status} - ${teste.descricao}`);
    console.log(`   CPF: "${teste.cpf}" | Esperado: ${teste.esperado} | Obtido: ${resultado}\n`);
});

console.log(`\n=== RESUMO ===`);
console.log(`Total de testes: ${testes.length}`);
console.log(`Passaram: ${passaram}`);
console.log(`Falharam: ${falharam}`);
