import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 4000;

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[server] ACERTE ou CAIA by BruCe rodando na porta ${PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] Falha ao iniciar:", err);
  process.exit(1);
});
