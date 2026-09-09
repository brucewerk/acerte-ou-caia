import mongoose from "mongoose";

let promessaConexao: Promise<typeof mongoose> | null = null;

/**
 * Conecta ao MongoDB Atlas reaproveitando a conexao entre chamadas.
 * Em ambiente serverless (Vercel), a mesma instancia pode processar varias
 * requisicoes seguidas; sem esse cache, cada requisicao abriria uma nova
 * conexao e esgotaria o limite do cluster rapidamente.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI nao foi definida no arquivo .env");
  }

  if (mongoose.connection.readyState === 1) {
    return; // ja conectado
  }

  if (!promessaConexao) {
    mongoose.set("strictQuery", true);
    promessaConexao = mongoose.connect(uri);
  }

  await promessaConexao;
  console.log("[db] Conectado ao MongoDB Atlas");

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] Conexao com o MongoDB foi encerrada");
    promessaConexao = null;
  });
}
