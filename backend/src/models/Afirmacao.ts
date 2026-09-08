import { Schema, model, Document } from "mongoose";

export interface IAfirmacao extends Document {
  afirmacao: string;
  verdadeira: boolean;
  categoria: string;
  ativa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AfirmacaoSchema = new Schema<IAfirmacao>(
  {
    afirmacao: { type: String, required: true, trim: true },
    verdadeira: { type: Boolean, required: true },
    categoria: { type: String, required: true, trim: true, default: "geral" },
    ativa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AfirmacaoSchema.index({ ativa: 1 });

export const Afirmacao = model<IAfirmacao>("Afirmacao", AfirmacaoSchema);
