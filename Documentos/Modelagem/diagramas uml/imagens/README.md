# Imagens dos Diagramas

---

## Geral

### Diagrama de caso de uso

<img align="center" src="Diagrama caso de uso - Scrum do Zero.png">

#### Descrição

**Criação de uma conta:**

Permitir ao usuário criar uma conta informando CPF, nome, email e senha.

**Pré-condição:** 
- usuário não pode já estar cadastrado com o mesmo cpf e email

**Logar em uma conta:**

Autenticar o usuário no sistema utilizando apenas CPF e senha.

**Pré-condição:** 
- este usuario já deve estar cadastrado

**Iniciar avaliação:**

Inicializa uma avaliação de um nível com questões selecionadas automaticamente dentro do grupo e nivel selecionados.

**Pré-condição:** 
- usuário ja deve estar cadastrado e logado no sistema
- devem existir tentativas ainda disponiveis. Sendo no máximo 2 tentativas por nível
- 10 questões devem ser selecionadas do banco de dados seguindo a lógida de serem do mesmo módulo e grupo.
- sendo 3 faceis, 4 médias e 3 difíceis

**Responder avaliação:**

Permitir o usuario responder as questôes selecionadas pelo sistema e validar sua resposta.

As respostas somente serão validadas após o exame ser finalizado, mostrando acertos e erros para o usuario. 

Após a validação a nota final será gerada e exposta ao usuário.

Caso feito na segunda tentativa a nota deve ser comparada com a da primeira tentativa  e caso ela supere  a anterior a nota mais alta do nível deve ser atualizada .

**Pré-condição:**  
- este usuario já deve estar cadastrado e realizando uma avaliação

**Visualizar tentativas:**

Um metodo do usuario visualizar quantas tentativas ainda restam para ele realizar cada exame. Sendo 2 tentativas por exame.

**Pré-condição:** 
- o usuario já deve estar cadastrado

**Consultar progresso:**

Permitir que o usuario acompanhe seu progresso nos níveis, visualizando os níveis concluidos contendo:
- notas em cada tentativa
- data e hora de envio
- questões respondidas na tentativa

**Pré-condição:** 
- este usuario já deve estar cadastrado

**Consultar média final:**

O usuário deve possuir a escolha de visualizar a média final dele antes de emitir o certificado, para saber o próprio desempenho.

isso poderá ser visivel tanto na área de consultar o progresso quanto antes de gerar o certificado, para que o usuário tenha plena certeza da nota que possuirá em seu certificado

**Pré-condição:** 
- chamado por emitir certificado
- o usuario precisa ja ter concluido cada um dos niveis

**Visualizar certificado:**

Gera um certificado para o usuário visualizar como ele será definido com base no desempenho atual dele.

o sistema irá calcular a média final dele com base na melhor nota obtida por cada um dos 5 níveis.

E então irá gerar o documento contendo, no mínimo: nome completo, CPF, email, data de emissão, e a média final (com discriminação das melhores notas por nível)

**Pré-condição:** 
- o usuario deve possuir todos os níveis concluidos

**Emitir certificado:**

Sendo feito exclusivamente após o usuário ja ter visualizado como o certificado será montado, ele gera o certificado oficial com as informações e disponibilizando para que ele possa baixa-lo

**Pré-condição:** 
- o usuario precisa ja ter concluido cada um dos niveis
- o usuário ja deve ter visualizado o certificado

---

### Diagrama de classes geral

<img align="center" src="classes geral.png">

#### Descrição

**Usuário:**

Representa um usuário cadastrado na plataforma, responsável por acessar os níveis disponíveis, realizar tentativas  acompanhar seu desempenho no sistema e gerar seu certificado.

**Certificado:**

Representa um certificado emitido ao usuário com base em seu desempenho na plataforma, contendo informações do usuário e a média final obtida, tendo como base a melhor nota obtida em cada um dos níveis.

**Progresso nível:**

Representa o progresso de um usuário em um nível específico, armazenando informações relacionadas ao desempenho, tentativas restantes e melhor nota obtida dentre as tentativas realizadas.

**Nível**

Representa um nível disponível no sistema, responsável por agrupar questões de determinada dificuldade ou etapa de aprendizagem.

**Tentativa:**

Representa uma tentativa realizada pelo usuário em um nível específico, sendo responsável por registrar o desempenho obtido e as respostas associadas à execução.

**Resposta:**

Representa a resposta fornecida pelo usuário para uma questão durante uma tentativa, armazenando a alternativa selecionada e o resultado da validação da resposta.

**Questões:**

Representa uma questão disponível no sistema, responsável por fornecer o enunciado, alternativas e critérios utilizados na validação das respostas do usuário.

---

### [Retornar para Diagramas UML](../README.md)