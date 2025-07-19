export type User = {
  _id?: string;
  typeLogin?: string; // Required
  id?: string;
  tokenLogin?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  refreshToken?: string;
  avatar?: string;
  role?: "USER" | "ADMIN" | "COMMENTATOR";
  level?: number;
  total_score?: number;
  address?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  enrolledCoursesCount?: number;
  phone?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export enum RoleType {
  USER = "USER",
  ADMIN = "ADMIN",
  COMMENTATOR = "COMMENTATOR",
}
