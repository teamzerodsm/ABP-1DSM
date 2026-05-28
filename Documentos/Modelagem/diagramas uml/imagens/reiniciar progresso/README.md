# Imagens dos diagramas

---

## Diagramas de reinicialização de progresso

### Classes reiniciar progresso

<img align="center" src="classes reiniciar progresso.png">

---

### Sequência pré requisitos incompletos

<img align="center" src="sequencia pré requisitos incompletos.png">

---

### Sequência reiniciar progresso

<img align="center" src="sequencia reiniciar progresso.png">

---

#### Descrição:

**Tela de progresso:**

Tela pessoal onde o usuário podera visualizar seu progresso com: 
- niveis concluidos
- tentativas por nivel 
- melhor nota por nível

ainda nesta tela ao selecionar uma tentativa ja realizada o usuário deverá visualizar novamente a tela de questionário já concluida para que ele possa visualizar seu historico de questões, pontuação e data e hora da resposta


**Pré-condição:** 
- usuário deve poder acessar o progresso a qualquer momento
- o historico de tentativa deve estar disponivel somente em niveis e tentativas já concluidos.

**Usuário:**

Representa um usuário cadastrado na plataforma, responsável por acessar os níveis disponíveis, realizar tentativas  acompanhar seu desempenho no sistema e gerar seu certificado.

**Progresso nível:**

Representa o progresso de um usuário em um nível específico, armazenando informações relacionadas ao desempenho, tentativas restantes e melhor nota obtida dentre as tentativas realizadas.

**Tentativa:**

Representa uma tentativa realizada pelo usuário em um nível específico, sendo responsável por registrar o desempenho obtido e as respostas associadas à execução.

**Resposta:**

Representa a resposta fornecida pelo usuário para uma questão durante uma tentativa, armazenando a alternativa selecionada e o resultado da validação da resposta.

**Questões:**

Representa uma questão disponível no sistema, responsável por fornecer o enunciado, alternativas e critérios utilizados na validação das respostas do usuário.

---

### [Retornar para Diagramas UML](../README.md)