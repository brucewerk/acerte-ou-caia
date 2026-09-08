import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI nao foi definida no arquivo .env");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);

  console.log("[db] Conectado ao MongoDB Atlas");

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] Conexao com o MongoDB foi encerrada");
  });
}
