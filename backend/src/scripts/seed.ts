import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import { Question } from "../models/Question";
import { Palavra } from "../models/Palavra";
import { Afirmacao } from "../models/Afirmacao";
import { bancoDeQuestoes } from "../data/questoes";
import { bancoDePalavras } from "../data/palavras";
import { bancoDeAfirmacoes } from "../data/afirmacoes";
import mongoose from "mongoose";
import { Model } from "mongoose";

/**
 * Remove indices "orfaos" de uma colecao, ou seja, indices que nao fazem
 * parte do schema atual do Mongoose. Isso evita erros de chave duplicada
 * quando uma collection ja existia no Atlas com um schema antigo/diferente.
 */
async function removerIndicesOrfaos(modelo: Model<any>, indicesValidos: string[]) {
  const indicesExistentes = await modelo.collection.indexes();
  for (const indice of indicesExistentes) {
    if (!["_id_", ...indicesValidos].includes(indice.name!)) {
      console.log(`[seed] Removendo indice orfao em ${modelo.collection.collectionName}: ${indice.name}`);
      await modelo.collection.dropIndex(indice.name!);
    }
  }
}

async function seed() {
  await connectDB();

  console.log("[seed] Verificando indices...");
  await removerIndicesOrfaos(Question, ["categoria_1_dificuldade_1_ativa_1"]);
  await removerIndicesOrfaos(Palavra, ["ativa_1"]);
  await removerIndicesOrfaos(Afirmacao, ["ativa_1"]);

  console.log("[seed] Limpando colecoes...");
  await Question.deleteMany({});
  await Palavra.deleteMany({});
  await Afirmacao.deleteMany({});

  console.log("[seed] Sincronizando indices dos schemas atuais...");
  await Question.syncIndexes();
  await Palavra.syncIndexes();
  await Afirmacao.syncIndexes();

  console.log(`[seed] Inserindo ${bancoDeQuestoes.length} perguntas de multipla escolha...`);
  await Question.insertMany(bancoDeQuestoes.map((q) => ({ ...q, ativa: true })));

  console.log(`[seed] Inserindo ${bancoDePalavras.length} palavras (Letras Embaralhadas)...`);
  await Palavra.insertMany(bancoDePalavras.map((p) => ({ ...p, ativa: true })));

  console.log(`[seed] Inserindo ${bancoDeAfirmacoes.length} afirmacoes (Sim ou Nao)...`);
  await Afirmacao.insertMany(bancoDeAfirmacoes.map((a) => ({ ...a, ativa: true })));

  const totalPerguntas = await Question.countDocuments();
  const totalPalavras = await Palavra.countDocuments();
  const totalAfirmacoes = await Afirmacao.countDocuments();
  console.log(
    `[seed] Concluido! Perguntas: ${totalPerguntas} | Palavras: ${totalPalavras} | Afirmacoes: ${totalAfirmacoes}`
  );

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Erro ao popular o banco:", err);
  process.exit(1);
});
