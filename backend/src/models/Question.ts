import { Schema, model, Document } from "mongoose";
import { IQuestionBase } from "../types";

export interface IQuestion extends IQuestionBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    pergunta: { type: String, required: true, trim: true },
    opcoes: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length === 4,
        message: "Cada pergunta precisa ter exatamente 4 opcoes",
      },
    },
    respostaCorreta: { type: Number, required: true, min: 0, max: 3 },
    categoria: {
      type: String,
      required: true,
      enum: [
        "geografia",
        "historia",
        "ciencias",
        "esportes",
        "entretenimento",
        "cultura-geral",
        "artes",
        "atualidades",
      ],
    },
    dificuldade: {
      type: String,
      required: true,
      enum: ["facil", "medio", "dificil"],
      default: "medio",
    },
    ativa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

QuestionSchema.index({ categoria: 1, dificuldade: 1, ativa: 1 });

export const Question = model<IQuestion>("Question", QuestionSchema);
