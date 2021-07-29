import { Request, Response, NextFunction } from "express";
import User from "../entity/User";
import { getRepository } from 'typeorm';

export const checkRole = (roles: Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = res.locals.jwtPayload;
        const userRepository = getRepository(User);
        let user: User;

        try {
            user = await userRepository.findOneOrFail(userId);
            const { role } = user;
            if (!roles.includes(role)) {
                return res.status(401).json({ message: "User not Authorize" });
            }
            next();
        } catch (error) {
            return res.status(401).json({ message: "Error en comprobacion" });
        }
    }
}