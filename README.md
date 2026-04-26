# ABP-1DSM
This repository has been created for publish our first project (Scrum learning website).
  
<h1 align="center">📘 Portal de Certificação em Métodologia Ágil – ABP</h1>

## 📌 Descrição do Projeto

Este projeto consiste no desenvolvimento de um **portal web para certificação interna em metodologias ágeis**, com foco em **Scrum**, como parte da Atividade Baseada em Projeto (ABP).

A aplicação permite que usuários se cadastrem, realizem avaliações organizadas por níveis de dificuldade e acompanhem sua evolução, culminando na emissão de um certificado com base no desempenho.

## 🎯 Objetivo Educacional

Integrar, em um único projeto prático, os principais conteúdos do semestre:

* Desenvolvimento de interfaces com **HTML, CSS e JavaScript (sem uso de frameworks)**
* Persistência de dados utilizando **PostgreSQL**
* Aplicação de **metodologias ágeis (Scrum)**
* Documentação do projeto com **UML**
* Organização e execução de projeto em equipe

## Sprints

|Sprint|Link|Início|Entrega|Status|
|---|---|---|---|---|
|01| <a href="#sprint1">Sprint 1</a>|13/04/2026|30/04/2026|🔄|
|02| <a href="#sprint2">Sprint 2</a>|04/06/2026|21/05/2026|❌|
|03| <a href="#sprint3">Sprint 3</a>|25/05/2026|11/06/2026|❌|

---

## 👥 Equipe

|Nome|Função|GitHub|
|---|---|---|
|Douglas Silva|Scrum Master|[Moraisdouglas](https://github.com/moraisdouglas)|
|Henrique Martins|Product Owner|[Henri-Bueno](https://github.com/Henri-Bueno)|
|Gabriel Gomes|Desenvolvedor|[gabrielgomesfernandes](https://github.com/gabrielgomesfernandes)|
|Jaqueline Medeiros|Desenvolvedor|[Jaqueline Medeiros](https://github.com/alves-medeiros)|
|Paulo Olivetti|Desenvolvedor|[pauloolivetti](https://github.com/pauloolivetti)|
|Tiago Ferreira|Desenvolvedor|[tiagof6](https://github.com/tiagof6)|
|Vítor Otavio|Desenvolvedor|[VirtusXD](https://github.com/VirtusXD)|

## 🛠️ Ferramentas utilizadas

<a href="https://www.w3.org/html/" target="_blank" rel="noreferrer">
<img height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" />
<a/> <br>
<a href="https://www.w3schools.com/css/" target="_blank" rel="noreferrer">
<img height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" />
<a/> <br>
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer">
<img height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" />
<a/> <br>
<a href="https://nodejs.org/pt" target="_blank" rel="noreferrer">
<img height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" />
<a/> <br>
<a href="https://www.figma.com/pt-br/" target="_blank" rel="noreferrer">
<img height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg" />
<a/> <br>
<a href="https://www.postgresql.org/" target="_blank" rel="noreferrer">
<img height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" />
<a/> <br>
<a href="https://git-scm.com/" target="_blank" rel="noreferrer">
<img height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" />
<a/> <br>
<a href="https://github.com/" target="_blank" rel="noreferrer">
<img height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" />
<a/> <br>

---

## 📝 Product Backlog

|Requisitos Funcionais|Requisitos|Sprint|
|---|---|---|
|RF-01|Criação do protótipo completo do sistema (login, avaliação, progresso e resultado).|#01|
|RF-02|Criação de um modelo visual do sistema (UI), aplicando o protótipo desenvolvido.|#01 <br> #02|
|RF-03|Implementação do sistema de autenticação de usuários (cadastro e login com CPF e senha).|#01|
|RF-04|Integração do front-end com o back-end para comunicação com o banco de dados (usuários e questões).|#01 <br> #02|
|RF-05|Implementação do sistema de avaliação por níveis, permitindo ao usuário responder questões e enviar respostas.|#01 <br> #02|
|RF-06|Implementação da seleção de questões por nível, respeitando a distribuição de dificuldade e aleatoriedade.|#02|
|RF-07|Implementação do controle de tentativas por nível, incluindo limite de tentativas e registro de histórico.|#02|
|RF-08|Implementação do sistema de cálculo de notas, considerando a melhor tentativa por nível.|#02|
|RF-09|Criação de um sistema de progressão visual ao usuário entre níveis com base no desempenho.|#02|
|RF-10|Implementação da visualização de progresso do usuário (níveis concluídos, notas e tentativas).|#02|
|RF-11|Implementação do cálculo da média final do usuário ao término dos níveis.|#03|
|RF-12|Implementação da geração e disponibilização do certificado de conclusão com dados do usuário.|#03|
|RF-13|Implementação de feedback visual ao usuário ao final das avaliações e durante o progresso.|#03|

<br>

|Requisitos Não Funcionais|Requisitos|Sprint|
|---|---|---|
|RNF-01|Utilização de HTML5, CSS3 e JavaScript para desenvolvimento da interface e integração com o sistema.|#01 <br> #02 <br> #03|
|RNF-02|O sistema deve ser responsivo e adaptável a diferentes dispositivos.|#02 <br> #03|
|RNF-03|O sistema deve garantir desempenho adequado nas operações de carregamento e envio de dados.|#02 <br> #03|
|RNF-04|O sistema deve garantir a segurança dos dados dos usuários (armazenamento seguro de credenciais).|#02|
|RNF-05|O sistema deve validar as regras de negócio no back-end, evitando manipulação indevida no front-end.|#02|
|RNF-06|O sistema deve garantir integridade e consistência dos dados de tentativas e resultados.|#02|
|RNF-07|O sistema deve apresentar interface simples, clara e de fácil navegação.|#01 <br> #02 <br> #03|
|RNF-08|O sistema deve possuir documentação básica para execução e entendimento do projeto.|#03|

---

# <div id="sprint1">Sprint 1</div>

## 🔄 SprintBacklog 1

|Atividade|Responsável|Tarefa iniciada|Tarefa concluída|Pontos|
|---|---|---|---|---|
|Construir a primeira parte do servidor - videoaula do Arley|Todos|✅||8|
|Diagrama de Caso de uso|Henrique|✅||3|
|Desenho do layout do site|Douglas e Jaqueline|✅||5|
|Desenho do layout das telas|Tiago e Jaqueline|✅||3|
|Definição da identidade visual do site|Vitor e Paulo|✅||5|
|Definição da fonte|Vitor e Paulo|✅||3|
|Definição da paleta de cores|Vitor e Paulo|||3|
|Descrever a sequencia das funções|Tiago e Jaqueline|✅||3|
|Estruturação e alimentação do GitHub|Gabriel|✅||1|
|Definição da modelagem do BD|Gabriel|||3|

# <div id="sprint2">Sprint 2</div>

**Sprint não iniciada**

# <div id="sprint3">Sprint 3</div>

**Sprint não iniciada**
