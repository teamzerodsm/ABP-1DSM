# Imagens dos diagramas

---

## Diagramas de inicialização de exame

### Classes exame

<img align="center" src="classes exame.png">

---

### Sequência falha ao finalizar

<img align="center" src="sequencia falha ao finalizar.png">

---

### Sequência finalizar exame

<img align="center" src="sequencia finalizar exame.png">

---

### Sequência iniciar exame

<img align="center" src="sequencia iniciar exame.png">

---

### Sequência limite de duas tentativas

<img align="center" src="sequencia limite de duas tentativas .png">

---

### Sequência responder questão

<img align="center" src="sequencia responder questao.png">

---

#### Descrição

**Home-page:**

Tela central do sistema, contendo as mais diferças interações úteis ao usuário sendo a central do sistema.

essa tela deve conter meios de acessar:
- Seleção dos níveis (1-5)
- Tela de visualização do certificado
- Tela de progresso do usúario
- tela de dados para permitir a alteração dos dados


**Pré-condição:** 
- usuário ja deve estar cadastrado e logado no sistema para visualizar

**Dialog-box:**

Pop-up referente ao nível selecionado pelo usuário, neste pop-up o usuário irá visualizar:
- titulo sobre o nível selecionado
- informações da melhor nota alcançada
- informação do número de tentativas restantes

**Pré-condição:** 
- aparecerá após o usuário selecionar o nível desejado

**Tela de questionário:**

Nesta tela o usuário irá visualizar a tela basica do exame contendo as 10 questões selecionadas e enviando as respostas.

exibindo para o usuário:
-  barra de progresso
- enunciado da questão
- alternativas de A até B
- prosseguir para próxima questão
- voltar para questão anterior
- finalizar exame (apenas na ultima questão)
  
 dessa forma o usuário irá ler o enunciado, marcar a alternativa correta e depois prosseguirá para a próxima etapa.

a resposta somente será validada após o usuário finalizar o exame, assim permitindo que ele volte para questões já marcadas para alterar as respostas.

 a barra de progresso permite que o usuário retorne de forma rápida diretamente para a questão escolhida, para que ele possa alterar a resposta escolhida.

a opção finalizar somente estará disponível na ultima questão do exame, na qual validará todas as respostas já marcadas.


**Pré-condição:** 
- usúario deve ter iniciado algum exame de nível na tela central

**Usuário:**

Representa um usuário cadastrado na plataforma, responsável por acessar os níveis disponíveis, realizar tentativas  acompanhar seu desempenho no sistema e gerar seu certificado.

**Progresso nível:**

Representa o progresso de um usuário em um nível específico, armazenando informações relacionadas ao desempenho, tentativas restantes e melhor nota obtida dentre as tentativas realizadas.

**Nível:**

Representa um nível disponível no sistema, responsável por agrupar questões de determinada dificuldade ou etapa de aprendizagem.

**Tentativa:**

Representa uma tentativa realizada pelo usuário em um nível específico, sendo responsável por registrar o desempenho obtido e as respostas associadas à execução.

**Questões:**

Representa uma questão disponível no sistema, responsável por fornecer o enunciado, alternativas e critérios utilizados na validação das respostas do usuário.

**Resposta:**

Representa a resposta fornecida pelo usuário para uma questão durante uma tentativa, armazenando a alternativa selecionada e o resultado da validação da resposta.

---

### [Retornar para Diagramas UML](../../README.md)