# ACERTE ou CAIA by BruCe

Jogo web inspirado no game show **Acerte ou Caia** (Tom Cavalcante, Rede Record). Voce entra
como Lider, escolhe seus adversarios e encara duelos por turnos contra CPUs com personalidade
propria, tentando sobreviver ao alcapao e acumular o maior premio possivel.

## Stack

- **Backend:** Node.js, Express, TypeScript, MongoDB Atlas (Mongoose), JWT (autenticacao)
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Web Audio API (efeitos sonoros)
- **Deploy sugerido:** Backend e Frontend na Vercel (cada um como projeto separado), banco no
  MongoDB Atlas

## Rodando tudo de uma vez (raiz do projeto)

```bash
npm install             # instala o "concurrently" usado para rodar os dois juntos
npm run install:all     # instala as dependencias do backend e do frontend
npm run seed             # popula o banco (perguntas, palavras, afirmacoes)
npm run dev               # sobe backend (porta 4000) e frontend (porta 5173) juntos
```

Crie os arquivos `.env` do `backend` e do `frontend` antes de rodar (veja abaixo).

## Estrutura de pastas

```
acerte-ou-caia/
├── package.json            # orquestra backend + frontend com "npm run dev"
├── backend/
│   ├── api/index.ts         # ponto de entrada serverless (deploy na Vercel)
│   ├── vercel.json
│   ├── src/
│   │   ├── config/          # conexao com o MongoDB (com cache para serverless)
│   │   ├── controllers/     # perguntas, palavras, afirmacoes, jogo, ranking, auth
│   │   ├── cpu/              # motor de inteligencia da CPU (niveis, decisoes)
│   │   ├── data/             # bancos de perguntas, palavras e afirmacoes (seed)
│   │   ├── middleware/       # autenticacao JWT, chave de admin, tratamento de erros
│   │   ├── models/           # Question, Palavra, Afirmacao, User, Player, GameResult
│   │   ├── routes/           # definicao das rotas REST
│   │   ├── scripts/          # script de seed do banco
│   │   ├── utils/            # helpers (ex.: parse de ids excluidos)
│   │   ├── app.ts
│   │   └── server.ts
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/               # clientes axios para a API (jogo + autenticacao)
    │   ├── auth/               # AuthContext (login/registro/perfil)
    │   ├── components/         # Palco, DuelPanel, LetrasEmbaralhadas, SimOuNao, CoinChoice...
    │   ├── game/                 # useJogo (maquina de estados), personas, premios, sons
    │   ├── pages/                 # Home, Game, Ranking, Admin, Login, Registrar, Perfil
    │   └── App.tsx
    └── .env.example
```

## Regras e mecanicas implementadas

- Lider (jogador humano) comeca com **3 vidas** e **escolhe livremente**, a cada duelo, qual
  dos adversarios restantes vai desafiar. A tela de escolha avisa marcos de progresso: "Faltam
  8 duelos para a grande final" (apos 2 vitorias), "Faltam 4" (apos 6), "Faltam 2" (apos 8) e
  "Este e o duelo final!" antes do 10º confronto.
- **Duelo por turnos, com o mesmo tipo de rodada do inicio ao fim**: ao escolher um
  adversario, o tipo de rodada (multipla escolha, Letras Embaralhadas ou Sim ou Nao) e
  sorteado uma unica vez e vale para todas as trocas de turno daquele duelo especifico.
- **Voce ve a CPU jogar de verdade**: no turno do adversario, uma rodada nova (nunca repetida)
  aparece na tela, com uma fase de "pensando" e depois a resposta da CPU sendo revelada
  visualmente — acertando (e devolvendo a vez) ou errando e caindo no alcapao, com efeito
  sonoro e animacao de queda.
- **Sem perguntas repetidas na mesma partida**: cada pergunta, palavra ou afirmacao sorteada
  (para o jogador OU para a CPU) fica marcada como usada e nunca volta a aparecer naquela
  partida, do primeiro duelo ao desafio final.
- Cada rodada tem limite de **30 segundos**, com tique-taque sonoro nos ultimos 5 segundos.
- O Lider pode **repassar** a rodada ao adversario gastando uma vida, em qualquer um dos 3
  tipos de rodada.
- **Letras Embaralhadas** aceita clique nas letras, **digitacao pelo teclado fisico**, ou
  **digitar a palavra inteira e confirmar** — acertando a palavra completa, vale na hora. As
  caixas de letra se ajustam automaticamente ao tamanho da tela (via `clamp()` com `vw`) para
  nunca quebrar linha, mesmo em palavras longas ou telas estreitas.
- **Modo microfone (opcional)**: o jogador pode ativar a resposta por voz (checkbox na tela
  inicial ou botao 🎙️ no cabecalho do jogo). Enquanto e a vez do Lider, o microfone fica
  ouvindo; falar a opcao certa (texto da alternativa, "letra A/B/C/D" ou "opcao 1/2/3/4"),
  "verdadeiro/falso" (ou "sim/nao"), ou a palavra inteira da rodada de Letras Embaralhadas
  conta ponto automaticamente. Disponivel apenas em navegadores com suporte a Web Speech API
  (Chrome/Edge); o botao so aparece quando o navegador suporta.
- **Baralho fixo de fichas por partida**: as fichas especiais **Vida Extra**, **Dividir por 2**
  e **Perde Tudo** aparecem **uma unica vez cada** em toda a partida, e nunca voltam a aparecer
  depois de reveladas (somem do painel). As demais 17 fichas sao valores **redondos** (multiplos
  de R$ 1.000) que, somados, fracionam o premio maximo do jogo comum (R$ 300.000). A vida extra
  nao tem teto: se o jogador nunca perdeu nenhuma vida, pode chegar a 4. Ao vencer um duelo, o
  Lider escolhe entre a moeda de **ouro** ou **prata**, sacadas sem reposicao desse baralho
  embaralhado — qual das duas guarda a melhor ficha e sorteado a cada duelo, sem vies. O painel
  revela o premio das duas moedas e avisa se a escolha foi boa ou ruim comparada a outra.
- **Painel de premios** (botao 💰 no cabecalho): mostra todas as fichas ainda disponiveis no
  baralho da partida (as reveladas somem da lista) e informa quanto dinheiro ainda pode ser
  conquistado.
- **Economia de vidas entre Lider e adversario**: se o Lider errar (ou o tempo esgotar) e ainda
  tiver vidas, ele nao cai — perde uma vida, que passa para o adversario, e a MESMA
  pergunta/palavra/afirmacao vai para o turno dele (o mesmo vale para o repasse manual). Se o
  adversario, tendo recebido vidas assim, tambem errar, ele nao cai: perde uma dessas vidas, que
  volta para o Lider, e o jogo segue. So cai quem errar sem ter mais vidas disponiveis.
- **Sim ou Nao com tema fixo por duelo**: ao cair a rodada Sim ou Nao, o tema (categoria) da
  primeira afirmacao sorteada e anunciado e vale para todas as afirmacoes daquele duelo,
  inclusive as do adversario.
- Apos vencer os 10 duelos, a **Grande Decisao**: parar com metade do premio ou arriscar no
  **desafio final** (10 perguntas em 2 minutos, sem repetir nada do que ja saiu na partida)
  para dobrar o premio.
- **Personas dos adversarios:** cada partida sorteia personagens diferentes (nome, emoji e
  frase de efeito) entre um banco de 15 personas.
- **Efeitos sonoros sintetizados** (sem arquivos externos, via Web Audio API): acerto, erro,
  queda, escolha de moeda, tique-taque do relogio, troca de turno e fanfarra de vitoria. Botao
  de mudo disponivel no cabecalho da tela de jogo.
- **Contas de jogador:** cadastro com email, nome de jogador e senha (ambos unicos), login,
  area de perfil para editar email/nome/senha. Jogadores logados tem o nome preenchido
  automaticamente e os resultados vinculados a conta; visitantes continuam podendo jogar e
  aparecer no ranking normalmente.
- **Ranking:** os 10 maiores premios ja conquistados ficam salvos e visiveis na tela de
  Ranking.
- **Painel do administrador:** CRUD completo do banco de perguntas de multipla escolha,
  protegido por uma chave simples (`ADMIN_KEY`). Palavras e afirmacoes por enquanto sao
  gerenciadas via API/seed (ver "Proximos passos").
- Interface **responsiva de ponta a ponta**: layout compacto pensado para caber sem rolagem
  excessiva em celulares na vertical e na horizontal (variante `landscape:` do Tailwind),
  tablets, notebooks e desktops. As caixas de letras do Letras Embaralhadas usam
  **ResizeObserver** para medir o espaco real disponivel e nunca quebram linha nem estouram o
  container, mesmo em palavras longas ou telas bem estreitas.
- **Visual imersivo e animado**: fundo com holofotes e particulas douradas flutuando (100% CSS,
  sem imagens externas), titulo com brilho animado na Home, avatares dos adversarios com selo
  em gradiente, queda no alcapao com tremor de tela e brilho vermelho, moeda girando em 3D ao
  ser escolhida, e confete comemorativo quando o jogador termina a partida com premio.

## Banco de conteudo

- `backend/src/data/questoes.ts`: **536 perguntas** de multipla escolha (8 categorias, 3
  dificuldades).
- `backend/src/data/palavras.ts`: **226 palavras** para a rodada Letras Embaralhadas.
- `backend/src/data/afirmacoes.ts`: **191 afirmacoes** para a rodada Sim ou Nao, distribuidas
  entre as 8 categorias (minimo de 16 por categoria, para sustentar duelos tematicos inteiros).
- **Total: quase 1.000 itens de conteudo.**

Isso ainda esta longe da faixa de 3.000 a 5.000 perguntas que foi pedida — gerar esse volume
com qualidade e fatos verificados exigiria varias rodadas de expansao. Os caminhos praticos
para continuar crescendo:
- Adicionar mais objetos aos arrays em `backend/src/data/*.ts` e rodar `npm run seed` de novo
  (é o que foi feito nas ultimas rodadas: comecei com ~300 itens e cheguei a quase 1.000).
- Cadastrar perguntas de multipla escolha direto pelo painel `/admin`, sem mexer em codigo.
- Pedir para eu continuar expandindo em proximas mensagens — cada lote de ~150-200 itens novos
  e viavel por vez mantendo a qualidade.

## Variaveis de ambiente

### backend/.env
```
PORT=4000
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/acerte-ou-caia?retryWrites=true&w=majority
ADMIN_KEY=troque-esta-chave
JWT_SECRET=troque-este-segredo-por-uma-string-longa-e-aleatoria
CORS_ORIGIN=http://localhost:5173
```

### frontend/.env
```
VITE_API_URL=http://localhost:4000/api
```

## Rodando localmente (backend e frontend separados)

```bash
cd backend
cp .env.example .env   # edite com seus valores
npm install
npm run seed
npm run dev             # http://localhost:4000

# em outro terminal
cd frontend
cp .env.example .env   # edite se necessario
npm install
npm run dev             # http://localhost:5173
```

## Deploy na Vercel (backend e frontend como dois projetos)

1. **MongoDB Atlas**: confirme que o Network Access libera `0.0.0.0/0` (a Vercel nao usa IP
   fixo em funcoes serverless).
2. **Backend**: Add New Project → mesmo repositorio → Root Directory `backend` → Framework
   Preset **Other** → configure `MONGODB_URI`, `ADMIN_KEY`, `JWT_SECRET`, `CORS_ORIGIN`
   (URL do frontend, sem barra no final) → Deploy.
3. **Frontend**: Add New Project → mesmo repositorio → Root Directory `frontend` → Framework
   Preset **Vite** → configure `VITE_API_URL` apontando para a URL do backend + `/api` →
   Deploy.
4. Depois que os dois estiverem no ar, revise `CORS_ORIGIN` no backend com a URL real do
   frontend e redeploy.

## Proximos passos sugeridos

- Adicionar CRUD visual no painel `/admin` para palavras e afirmacoes (hoje so perguntas de
  multipla escolha tem interface).
- Continuar expandindo os bancos de conteudo rumo a milhares de itens.
- Historico de partidas por jogador logado (hoje o perfil edita dados, mas nao lista jogos
  anteriores).
- Efeitos visuais adicionais (confete na vitoria, transicoes de tela mais elaboradas).
