# Imagens dos diagramas

## Diagramas de certificado

### Classes certificado

<img align="center" src="classes certificado.png">

### Sequência níveis incorretos

<img align="center" src="sequencia niveis incompletos.png">

### Sequencia todos os níveis concluídos

<img align="center" src="sequencia todos os niveis concluidos.png">

#### Descrição

**Usuário:**

Representa um usuário cadastrado na plataforma, responsável por acessar os níveis disponíveis, realizar tentativas  acompanhar seu desempenho no sistema e gerar seu certificado.

**Progresso nível:**

Representa o progresso de um usuário em um nível específico, armazenando informações relacionadas ao desempenho, tentativas restantes e melhor nota obtida dentre as tentativas realizadas.

**Tentativa:**

Representa uma tentativa realizada pelo usuário em um nível específico, sendo responsável por registrar o desempenho obtido e as respostas associadas à execução.

**Certificado:**

Representa um certificado emitido ao usuário com base em seu desempenho na plataforma, contendo informações do usuário e a média final obtida, tendo como base a melhor nota obtida em cada um dos níveis.

**Tela de certificado:**

Nesta tela o usuário irá visualizar como estão as informações em seu certificado. Verificando seus dados pessoais e os registros obtidos por concluir o curso.

exibindo para o usuário:
- pré visualização do certificado
   - contendo:
     - dados pessoais (nome, email, cpf e nro do certificado)
     - melhores notas por nível 
     - nota média final
- botão para dowload em pdf
  
dessa forma o usuário irá visualizar se está tudo correto com suas informações pessoais e se as notas estão satisfatórias no certificado.

após isso ele poderá fazer o dowload para possuir o próprio certificado em mãos.

Pré-condiçâo: 
- usúario somente acessará esta tela após concluir pelo menos uma tentativa em cada um dos 5 níveis

---