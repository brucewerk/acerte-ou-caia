import { PremioOuModificador } from "../types";

/**
 * Painel de valores e modificadores atras das moedas de ouro/prata.
 * A maior parte das casas tem valores em dinheiro (R$1 a R$30.000);
 * uma fracao menor traz os modificadores dramáticos do programa.
 */
const VALORES_EM_DINHEIRO = [1, 50, 100, 250, 500, 1000, 2500, 5000, 7500, 10000, 15000, 20000, 30000];

export function sortearPremioOuModificador(): PremioOuModificador {
  const r = Math.random();

  if (r < 0.08) return { tipo: "vida-extra" };
  if (r < 0.16) return { tipo: "dividir-por-2" };
  if (r < 0.22) return { tipo: "perde-tudo" };

  const valor = VALORES_EM_DINHEIRO[Math.floor(Math.random() * VALORES_EM_DINHEIRO.length)];
  return { tipo: "valor", valor };
}

/**
 * Sorteia o conteudo das duas moedas (ouro e prata) de uma so vez, para que
 * o painel possa revelar tambem o que estava na moeda nao escolhida.
 */
export function sortearParDeMoedas(): { ouro: PremioOuModificador; prata: PremioOuModificador } {
  return { ouro: sortearPremioOuModificador(), prata: sortearPremioOuModificador() };
}

export function descreverPremio(p: PremioOuModificador): string {
  switch (p.tipo) {
    case "valor":
      return `+ ${p.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
    case "vida-extra":
      return "Vida extra!";
    case "dividir-por-2":
      return "Dividir por 2";
    case "perde-tudo":
      return "Perde tudo!";
  }
}
