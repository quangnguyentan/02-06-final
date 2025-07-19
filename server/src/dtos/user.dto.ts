export interface UserPayload {
  _id: string;
  role: string;
  tokenLogin: string;
  id: string;
}

declare global {
  namespace Express {
    interface User extends UserPayload {} // Đảm bảo Express.User có đầy đủ các thuộc tính của UserPayload
    interface Request {
      user?: Express.User;
    }
  }
}
