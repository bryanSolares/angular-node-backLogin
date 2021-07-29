import { getRepository } from "typeorm";
import { Request, Response } from "express";
import User from "../entity/User";
import * as jwt from 'jsonwebtoken';
import config from "../config/config";
import { validate } from 'class-validator';

class AuthController {
    static login = async (req: Request, res: Response) => {
        const { username, password } = req.body;

        if (!(username && password)) {
            return res.status(400).json({ message: "User name and Password are required!" });
        }

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail({ where: { username } });
            if (!user.checkPassword(password)) {
                return res.status(401).json({ message: "Username or Password incorrects!" })
            }
            const token = jwt.sign({ userId: user.userId, username: user.username }, config.jwtSecret, { expiresIn: '1h' });
            const { username: usuario } = user;
            return res.json({ User: usuario, token });

        } catch (error) {
            console.error(error);
            return res.status(404).json({ message: "User not found" })
        }

    }

    static changePassword = async (req: Request, res: Response) => {
        const { userId } = res.locals.jwtPayload;
        const { oldPassword, newPassword } = req.body;

        if (!(oldPassword && newPassword)) {
            return res.status(400).json({ message: "Old password and new password are required" });
        }

        const userRepository = getRepository(User);
        try {
            const user = await userRepository.findOneOrFail(userId);

            if (!user) {
                return res.status(400).json({ message: "User not exists" });
            }

            if (!user.checkPassword(oldPassword)) {
                return res.status(401).json({ message: "Check your old password!" });
            }

            user.password = newPassword;
            const validateOptions = { validationError: { target: false, value: false } };
            const errors = await validate(user, validateOptions);

            if (errors.length > 0) {
                return res.status(401).json(errors);
            }

            user.hashPassword();
            await userRepository.save(user);

            res.json({ message: "Congratulation Changed Password!" })

        } catch (error) {
            return res.status(400).json({ message: "Somenthing goes wrong!" });
        }
    }
}

export default AuthController;