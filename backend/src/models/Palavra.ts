import { Schema, model, Document } from "mongoose";

export interface IPalavra extends Document {
  palavra: string; // sempre armazenada em maiusculas, sem acentos, para facilitar o jogo
  dica: string;
  categoria: string;
  ativa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PalavraSchema = new Schema<IPalavra>(
  {
    palavra: { type: String, required: true, trim: true, uppercase: true },
    dica: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true, default: "geral" },
    ativa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PalavraSchema.index({ ativa: 1 });

export const Palavra = model<IPalavra>("Palavra", PalavraSchema);
