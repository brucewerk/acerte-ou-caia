import { Schema, model, Document } from "mongoose";

export interface IPlayer extends Document {
  nome: string;
  avatar?: string;
  criadoEm: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  nome: { type: String, required: true, trim: true, unique: true },
  avatar: { type: String },
  criadoEm: { type: Date, default: Date.now },
});

export const Player = model<IPlayer>("Player", PlayerSchema);
