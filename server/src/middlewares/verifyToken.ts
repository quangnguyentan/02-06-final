import { NextFunction, Request, Response } from "express"
import { UserPayload } from "../dtos/user.dto";
import jwt from 'jsonwebtoken';

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1]
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                mes: 'Invalid access token',
            });
            return
        }
    } else {
        res.status(401).json({
            success: false,
            mes: 'Require authentication!!!'
        })
        return
    }
}
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            mes: "REQUIRE ADMIN ROLE",
        });
    }
    next();
}

