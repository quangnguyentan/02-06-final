import jwt from "jsonwebtoken";

export const generateAccessToken = (uid: unknown, role: string) =>
  jwt.sign({ _id: uid, role: role }, process.env.JWT_SECRET as string, {
    expiresIn: "2d",
  });
export const generateRefreshToken = (uid: unknown) =>
  jwt.sign({ _id: uid }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
