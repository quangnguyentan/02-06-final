import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
export interface IUser extends Document {
  typeLogin: string;
  id: string;
  tokenLogin: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  refreshToken: string;
  avatar?: string;
  role: "USER" | "ADMIN" | "COMMENTATOR";
  level: number;
  address: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  isCorrectPassword(password: string): Promise<boolean>;
  createPasswordChangedToken(): string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: string;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String },
    typeLogin: { type: String },
    tokenLogin: { type: String },
    username: { type: String },
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String },
    password: { type: String },
    refreshToken: { type: String, default: "" },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "COMMENTATOR"],
      default: "USER",
    },
    level: { type: Number, default: 0 },
    address: { type: String, default: "" },
    gender: { type: String, default: "MALE" },
    phone: { type: String, default: "" },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    passwordChangedAt: { type: String },
  },
  {
    timestamps: true,
  }
);
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
UserSchema.methods.isCorrectPassword = async function (
  password: string
): Promise<boolean> {
  if (!password || !this.password) {
    console.error("Missing password or hash for comparison");
    return false;
  }

  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    console.error("Error comparing passwords", err);
    return false;
  }
};
UserSchema.methods.createPasswordChangedToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
  return resetToken;
};
export default mongoose.model<IUser>("User", UserSchema);
