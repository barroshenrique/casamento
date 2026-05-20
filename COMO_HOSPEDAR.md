# Como Hospedar o seu Site de Casamento no GitHub Pages (Gratuito)

Parabéns! Este documento irá guiar você, Henrique e Nathália, no passo a passo ultra-simples para colocar o site do seu casamento no ar **100% de graça** utilizando o GitHub Pages. Além disso, mostraremos como criar um banco de dados em tempo real gratuito no Firebase para que os presentes sincronizem automaticamente.

---

## 📌 PARTE 1: Colocando o Site no Ar pelo GitHub Pages (Em 3 Minutos)

O GitHub Pages permite hospedar sites estáticos de forma totalmente gratuita. Como o site foi desenvolvido com tecnologias modernas puras (HTML/CSS/JS), o processo é super simples:

### Passo 1: Criar uma conta no GitHub
1. Acesse [github.com](https://github.com/) e crie uma conta gratuita (caso ainda não tenha).
2. Confirme seu e-mail.

### Passo 2: Criar um Novo Repositório
1. Na sua página inicial do GitHub, clique no botão verde **"New"** (Novo) no canto superior esquerdo, ou acesse [github.com/new](https://github.com/new).
2. No campo **Repository name** (Nome do repositório), digite exatamente o nome que deseja para o link (exemplo: `casamento`).
3. Certifique-se de que a opção do repositório está marcada como **Public** (Público) - *isso é necessário para a hospedagem gratuita*.
4. Deixe todas as outras opções como estão (não marque "Add a README file") e clique no botão verde **"Create repository"** (Criar repositório) no final da página.

### Passo 3: Enviar os arquivos do Site
1. Na tela que abrir, você verá algumas linhas de comando. Ignore-as e procure por um link que diz: **"uploading an existing file"** (enviar um arquivo existente) bem no meio do texto e clique nele.
2. Agora, basta abrir a pasta onde estão os arquivos deste site no seu computador (onde fica o `index.html`, a pasta `css`, a pasta `js`, etc.).
3. **Selecione TODOS os arquivos e pastas** (incluindo as pastas `css`, `js`, `assets`) e **arraste e solte** dentro do quadrado na página do GitHub.
4. Aguarde todos os arquivos terminarem de carregar (você verá uma barra de progresso para cada um).
5. Na parte inferior da página, no campo **"Commit changes"**, clique no botão verde escrito **"Commit changes"** (Salvar alterações). Aguarde alguns segundos.

### Passo 4: Ativar o GitHub Pages
1. Na barra superior do seu repositório no GitHub, clique na engrenagem **"Settings"** (Configurações).
2. No menu lateral esquerdo, na seção **Code and automation**, clique em **"Pages"**.
3. Na seção **Build and deployment**, onde diz **Source**, certifique-se de que está selecionado **"Deploy from a branch"**.
4. Abaixo, onde diz **Branch**, clique onde está escrito **"None"** e mude para **"main"** (ou `master`). Deixe a pasta ao lado como `/(root)` e clique em **"Save"** (Salvar).
5. Aguarde cerca de 1 a 2 minutos. Atualize a página.
6. Na parte superior da mesma página de configurações de Pages, aparecerá um quadro colorido com a mensagem: 
   👉 **"Your site is live at..."** seguido do seu link (exemplo: `https://seu-usuario.github.io/casamento/`).

**PRONTO!** Seu site já está no ar para qualquer convidado acessar de qualquer celular ou computador!

---

## 📌 PARTE 2: Configurando a Lista de Presentes Online (Firebase Gratuito)

Se você deixar o site como está, ele funcionará no **Modo Local (LocalStorage)**. Isso significa que se um convidado confirmar um presente, ficará salvo apenas no celular dele. 

Para que os presentes sincronizem **em tempo real** para todos os convidados no ar, você precisa de um banco de dados na nuvem. O **Firebase** (do Google) oferece isso de forma gratuita e rápida.

### Passo 1: Criar o Projeto no Firebase
1. Acesse o [Firebase Console](https://console.firebase.google.com/) e faça login com qualquer conta do Gmail.
2. Clique em **"Adicionar projeto"** (ou "Criar projeto").
3. Digite um nome para o seu projeto (exemplo: `casamento-henrique-nathalia`) e clique em **Continuar**.
4. Desative a opção do Google Analytics (para ser mais rápido e simples) e clique em **"Criar projeto"**.
5. Aguarde alguns segundos e clique em **Continuar**.

### Passo 2: Criar o Banco de Dados (Firestore)
1. No painel esquerdo do Firebase, clique em **"Build"** (Construção) e depois em **"Firestore Database"**.
2. Clique no botão **"Criar banco de dados"**.
3. Em "Localização do Cloud Firestore", selecione um servidor próximo (exemplo: `southamerica-east1` em São Paulo) e clique em **Avançar**.
4. Na tela de regras, selecione **"Iniciar no modo de teste"** (isso permite que seus convidados reservem presentes sem precisar fazer login complexo) e clique em **Criar**.
5. *Nota:* As regras do modo de teste expiram em 30 dias por padrão. Para manter o site funcionando para sempre, clique na aba **"Regras"** (Rules) no topo do Firestore e cole o seguinte código:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   Clique no botão azul **"Publicar"** (Publish) no canto superior direito das regras.

### Passo 3: Registrar o Site no Firebase
1. Volte para a página inicial do Firebase (clique em "Visão geral do projeto" no canto superior esquerdo).
2. No centro da tela, clique no ícone de **Web** (o desenho de um código `</>`).
3. Digite o apelido do aplicativo (exemplo: `Site Casamento`) e clique em **"Registrar app"**.
4. O Firebase exibirá um bloco de código chamado `firebaseConfig` parecido com este:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyA1...",
     authDomain: "casamento-...",
     projectId: "casamento-...",
     storageBucket: "casamento-...",
     messagingSenderId: "123456...",
     appId: "1:123456..."
   };
   ```
5. **Copie apenas os valores de dentro desse objeto**.

### Passo 4: Colar as Chaves no seu Site
1. No seu computador, abra a pasta do site de casamento.
2. Abra a pasta `js` e abra o arquivo `config.js` com qualquer bloco de notas (ou editor de texto).
3. Substitua os campos que estão lá pelas suas chaves copiadas do Firebase.
4. Mude a linha `export const USE_FIREBASE = false;` para `export const USE_FIREBASE = true;`.
5. Salve o arquivo.
6. Suba esse arquivo `js/config.js` atualizado para o seu repositório no GitHub (basta arrastar para a página de arquivos do GitHub e commitar novamente).

**SUCESSO TOTAL!** Agora sua lista de presentes sincroniza instantaneamente na nuvem, e todas as modificações que vocês fizerem no Painel Admin (cores, abas, história) ficarão salvas para sempre na internet para todos os convidados verem!
