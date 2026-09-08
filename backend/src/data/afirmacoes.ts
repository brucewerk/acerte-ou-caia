export interface AfirmacaoSeed {
  afirmacao: string;
  verdadeira: boolean;
  categoria: string;
}

/**
 * Banco de afirmacoes da rodada especial "Sim ou Nao".
 * O jogador deve dizer se a afirmacao e verdadeira ou falsa.
 */
export const bancoDeAfirmacoes: AfirmacaoSeed[] = [
  { afirmacao: "O Brasil ja foi pentacampeao da Copa do Mundo de futebol.", verdadeira: true, categoria: "esportes" },
  { afirmacao: "A capital do Brasil e o Rio de Janeiro.", verdadeira: false, categoria: "geografia" },
  { afirmacao: "A agua ferve a 100 graus Celsius ao nivel do mar.", verdadeira: true, categoria: "ciencias" },
  { afirmacao: "O Sol e um planeta do Sistema Solar.", verdadeira: false, categoria: "ciencias" },
  { afirmacao: "Machado de Assis escreveu 'Dom Casmurro'.", verdadeira: true, categoria: "artes" },
  { afirmacao: "A Muralha da China fica no Japao.", verdadeira: false, categoria: "geografia" },
  { afirmacao: "O coracao humano tem quatro camaras.", verdadeira: true, categoria: "ciencias" },
  { afirmacao: "Pele nunca foi campeao mundial de futebol.", verdadeira: false, categoria: "esportes" },
  { afirmacao: "A Segunda Guerra Mundial terminou em 1945.", verdadeira: true, categoria: "historia" },
  { afirmacao: "O Monte Everest fica na Africa.", verdadeira: false, categoria: "geografia" },
  { afirmacao: "O Pix e um sistema de pagamentos instantaneos brasileiro.", verdadeira: true, categoria: "atualidades" },
  { afirmacao: "Marte e conhecido como o 'planeta azul'.", verdadeira: false, categoria: "ciencias" },
  { afirmacao: "Tiradentes participou da Inconfidencia Mineira.", verdadeira: true, categoria: "historia" },
  { afirmacao: "O Vaticano e o maior pais do mundo em area.", verdadeira: false, categoria: "geografia" },
  { afirmacao: "O basquete e jogado com 5 jogadores de cada time em quadra.", verdadeira: true, categoria: "esportes" },
  { afirmacao: "A Monalisa foi pintada por Michelangelo.", verdadeira: false, categoria: "artes" },
  { afirmacao: "O Brasil faz fronteira com a Argentina.", verdadeira: true, categoria: "geografia" },
  { afirmacao: "Um triangulo tem quatro lados.", verdadeira: false, categoria: "cultura-geral" },
  { afirmacao: "A Lua e um satelite natural da Terra.", verdadeira: true, categoria: "ciencias" },
  { afirmacao: "O carnaval brasileiro acontece no mes de dezembro.", verdadeira: false, categoria: "cultura-geral" },
  { afirmacao: "Albert Einstein desenvolveu a Teoria da Relatividade.", verdadeira: true, categoria: "ciencias" },
  { afirmacao: "O oceano Pacifico e menor que o oceano Atlantico.", verdadeira: false, categoria: "geografia" },
  { afirmacao: "O Maracana fica na cidade do Rio de Janeiro.", verdadeira: true, categoria: "esportes" },
  { afirmacao: "Dom Pedro II foi o primeiro imperador do Brasil.", verdadeira: false, categoria: "historia" },
  { afirmacao: "O corpo humano adulto tem cerca de 206 ossos.", verdadeira: true, categoria: "ciencias" },
  { afirmacao: "A Torre Eiffel fica em Londres.", verdadeira: false, categoria: "geografia" },
  { afirmacao: "O WhatsApp e um aplicativo de mensagens instantaneas.", verdadeira: true, categoria: "atualidades" },
  { afirmacao: "Todos os planetas do Sistema Solar tem aneis visiveis.", verdadeira: false, categoria: "ciencias" },
  { afirmacao: "O futebol e disputado com 11 jogadores de linha por time.", verdadeira: true, categoria: "esportes" },
  { afirmacao: "A Grande Muralha da China pode ser vista a olho nu da Lua.", verdadeira: false, categoria: "cultura-geral" },
  { afirmacao: "O Brasil foi descoberto pelos portugueses em 1500.", verdadeira: true, categoria: "historia" },
  { afirmacao: "O gelo e mais denso que a agua liquida.", verdadeira: false, categoria: "ciencias" },
  { afirmacao: "A capital da Franca e Paris.", verdadeira: true, categoria: "geografia" },
  { afirmacao: "Um ano bissexto tem 365 dias.", verdadeira: false, categoria: "cultura-geral" },
  { afirmacao: "Van Gogh pintou a obra 'Noite Estrelada'.", verdadeira: true, categoria: "artes" },
  { afirmacao: "O Pantanal fica na regiao Nordeste do Brasil.", verdadeira: false, categoria: "geografia" },
  { afirmacao: "A Amazonia e considerada o 'pulmao do mundo'.", verdadeira: true, categoria: "geografia" },
  { afirmacao: "Todo polvo tem apenas um coracao.", verdadeira: false, categoria: "ciencias" },
  { afirmacao: "O tenis e disputado em uma quadra com uma rede.", verdadeira: true, categoria: "esportes" },
  { afirmacao: "A Estatua da Liberdade fica em Paris.", verdadeira: false, categoria: "geografia" },
];
