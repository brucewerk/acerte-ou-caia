import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  nomeJogador: string;
  senhaHash: string;
  criadoEm: Date;
  compararSenha(senha: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  nomeJogador: { type: String, required: true, unique: true, trim: true },
  senhaHash: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now },
});

UserSchema.methods.compararSenha = function (senha: string) {
  return bcrypt.compare(senha, this.senhaHash);
};

export const User = model<IUser>("User", UserSchema);
