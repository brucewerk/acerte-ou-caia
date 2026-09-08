# ACERTE ou CAIA by BruCe

Jogo web inspirado no game show **Acerte ou Caia** (Tom Cavalcante, Rede Record). Voce entra
como Lider e enfrenta 10 adversarios controlados por CPU em duelos por turnos, tentando
sobreviver ao alcapao e acumular o maior premio possivel.

## Stack

- **Backend:** Node.js, Express, TypeScript, MongoDB Atlas (Mongoose)
- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Deploy sugerido:** Backend no Render, Frontend na Vercel, banco no MongoDB Atlas

## Rodando tudo de uma vez (raiz do projeto)

Na raiz do repositorio ha um `package.json` que orquestra backend e frontend juntos com o
pacote `concurrently`:

```bash
npm run install:all   # instala as dependencias do backend e do frontend
npm run seed           # popula o banco (perguntas, palavras e afirmacoes)
npm run dev             # sobe backend (porta 4000) e frontend (porta 5173) juntos
```

Lembre-se de criar os arquivos `.env` do `backend` e do `frontend` antes (veja abaixo) — o
`npm run install:all` nao faz isso automaticamente.

## Estrutura de pastas

```
acerte-ou-caia/
├── package.json           # orquestra backend + frontend com "npm run dev"
├── backend/
│   ├── src/
│   │   ├── config/        # conexao com o MongoDB
│   │   ├── controllers/   # logica das rotas (perguntas, palavras, afirmacoes, jogo, ranking)
│   │   ├── cpu/           # motor de inteligencia da CPU (niveis, decisoes)
│   │   ├── data/          # bancos de perguntas, palavras e afirmacoes usados no seed
│   │   ├── middleware/    # autenticacao simples de admin, tratamento de erros
│   │   ├── models/        # schemas do Mongoose (Question, Palavra, Afirmacao, Player, GameResult)
│   │   ├── routes/        # definicao das rotas REST
│   │   ├── scripts/       # script de seed do banco
│   │   ├── types/         # tipos compartilhados
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/            # clientes axios para a API
    │   ├── components/     # Palco, DuelPanel, LetrasEmbaralhadas, SimOuNao, CoinChoice, etc.
    │   ├── game/            # maquina de estados (useJogo), personas e regras de premios
    │   ├── pages/           # Home, Game, Ranking, Admin
    │   ├── types/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tailwind.config.js
    └── .env.example
```

## Regras implementadas

- Lider (jogador humano) comeca com **3 vidas** e enfrenta **10 adversarios** controlados por
  CPU, escolhidos **pelo proprio jogador** a cada duelo (tela "Escolha quem voce vai
  desafiar").
- **Duelo por turnos:** o Lider responde uma rodada; se acertar, a vez passa para o
  adversario, que responde de acordo com a propria inteligencia (genio 96%, mediano 92%,
  fraco 80% de taxa de acerto). O duelo continua alternando turnos ate que um dos dois erre e
  caia no alcapao.
- **3 tipos de rodada**, sorteados aleatoriamente a cada turno do Lider:
  - **Multipla escolha** (~62% das rodadas): pergunta com 4 alternativas.
  - **Letras Embaralhadas** (~19%): uma palavra aparece com parte das letras reveladas; o
    jogador completa clicando nas letras que faltam (com suporte a teclado fisico) ou
    digitando a palavra inteira no campo de texto — se digitar certo, vale na hora.
  - **Sim ou Nao** (~19%): uma afirmacao que pode ser verdadeira ou falsa.
- Cada rodada tem limite de **30 segundos**. Errar ou estourar o tempo derruba o competidor no
  alcapao.
- O Lider pode **repassar** a rodada ao adversario gastando uma vida, em qualquer um dos 3
  tipos de rodada.
- Ao vencer um duelo, o Lider escolhe entre a moeda de **ouro** ou **prata** do adversario
  derrotado. O painel revela o premio das **duas** moedas (a escolhida e a que ficou de fora),
  podendo ser um valor em dinheiro (R$ 1 a R$ 30.000) ou um modificador: **Vida Extra**,
  **Dividir por 2** ou **Perde Tudo**.
- Apos vencer os 10 duelos, a **Grande Decisao**: parar e levar metade do premio acumulado, ou
  arriscar no **desafio final** (10 perguntas em 2 minutos) para dobrar o premio.
- **Personas dos adversarios:** cada partida sorteia 10 personagens diferentes (nome, emoji e
  frase de efeito) entre um banco de personas, dando identidade visual a cada estacao.
- **Ranking:** os 10 maiores premios ja conquistados ficam salvos e visiveis na tela de
  Ranking.
- **Painel do administrador:** CRUD completo do banco de perguntas de multipla escolha
  (criar, listar, ativar/desativar, excluir), protegido por uma chave simples (`ADMIN_KEY`).
  Palavras e afirmacoes por enquanto sao gerenciadas via API/seed (ver "Proximos passos").

## Rodando localmente (backend e frontend separados)

Se preferir rodar cada parte em terminais separados em vez do `npm run dev` da raiz:

### 1. Backend

```bash
cd backend
cp .env.example .env
# edite o .env com sua string de conexao do MongoDB Atlas e defina uma ADMIN_KEY
npm install
npm run seed   # popula perguntas, palavras e afirmacoes
npm run dev    # inicia a API em http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL deve apontar para a API (http://localhost:4000/api em desenvolvimento)
npm install
npm run dev    # inicia o frontend em http://localhost:5173
```

Abra `http://localhost:5173` no navegador.

## Deploy

### MongoDB Atlas
1. Crie (ou reutilize) um cluster no Atlas.
2. Crie um usuario de banco e libere o IP `0.0.0.0/0` (ou o IP do Render) em Network Access.
3. Copie a connection string para `MONGODB_URI`.

### Backend no Render
1. Crie um novo **Web Service** apontando para a pasta `backend` do repositorio.
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Configure as variaveis de ambiente: `MONGODB_URI`, `ADMIN_KEY`, `CORS_ORIGIN` (URL da
   Vercel depois de publicada), `PORT` (o Render define automaticamente, mas o app tambem
   funciona com a porta padrao 4000).
5. Depois do primeiro deploy, rode `npm run seed` localmente apontando o `MONGODB_URI` de
   producao (ou crie um Job/Shell no Render) para popular o banco.

### Frontend na Vercel
1. Importe a pasta `frontend` do repositorio como novo projeto na Vercel.
2. Framework preset: **Vite**.
3. Configure a variavel de ambiente `VITE_API_URL` apontando para a URL publicada do backend
   no Render, terminando em `/api` (ex.: `https://acerte-ou-caia-api.onrender.com/api`).
4. Deploy.

### Git
```bash
cd acerte-ou-caia
git init
git add .
git commit -m "ACERTE ou CAIA by BruCe"
git branch -M main
git remote add origin <url-do-seu-repositorio>
git push -u origin main
```

## Expandindo os bancos de conteudo

- `backend/src/data/questoes.ts`: 210 perguntas de multipla escolha (8 categorias, 3
  dificuldades).
- `backend/src/data/palavras.ts`: banco de palavras para a rodada Letras Embaralhadas.
- `backend/src/data/afirmacoes.ts`: banco de afirmacoes para a rodada Sim ou Nao.

Para expandir qualquer um dos tres, adicione mais objetos ao array correspondente e rode
`npm run seed` novamente. Perguntas de multipla escolha tambem podem ser cadastradas pelo
painel `/admin` sem mexer no codigo.

## Proximos passos sugeridos

- Adicionar CRUD visual no painel `/admin` para palavras e afirmacoes (hoje so perguntas de
  multipla escolha tem interface; os outros dois bancos sao editados via codigo/seed).
- Cadastrar mais conteudo ate atingir a escala desejada (centenas/milhares em cada banco).
- Adicionar autenticacao completa de administrador (hoje e uma chave simples via header).
- Adicionar efeitos sonoros.
