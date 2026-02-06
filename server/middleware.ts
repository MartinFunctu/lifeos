import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "./logger";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
        email: string;
    };
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: number;
            username: string;
            email: string;
        };

        req.user = decoded;
        next();
    } catch (error) {
        logger.error("Invalid token", error);
        res.status(401).json({ message: "Invalid token" });
    }
};
