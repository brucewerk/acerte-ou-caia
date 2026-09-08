import { Schema, model, Document, Types } from "mongoose";

export interface IGameResult extends Document {
  jogador: string;
  premioFinal: number;
  duelosVencidos: number;
  chegouAoDesafioFinal: boolean;
  dobrouPremio: boolean;
  data: Date;
}

const GameResultSchema = new Schema<IGameResult>({
  jogador: { type: String, required: true, trim: true },
  premioFinal: { type: Number, required: true, default: 0 },
  duelosVencidos: { type: Number, required: true, default: 0 },
  chegouAoDesafioFinal: { type: Boolean, default: false },
  dobrouPremio: { type: Boolean, default: false },
  data: { type: Date, default: Date.now },
});

GameResultSchema.index({ premioFinal: -1 });

export const GameResult = model<IGameResult>("GameResult", GameResultSchema);
