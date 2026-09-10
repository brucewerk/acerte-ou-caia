import axios from "axios";

/** Extrai uma mensagem de erro legivel de uma resposta da API, com um fallback generico. */
export function mensagemDeErro(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && typeof err.response?.data?.erro === "string") {
    return err.response.data.erro;
  }
  return fallback;
}
