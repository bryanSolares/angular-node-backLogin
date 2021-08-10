import { getRepository } from "typeorm";
import { Request, Response } from "express";
import User from '../entity/User';
import * as jwt from 'jsonwebtoken';
import config from "../config/config";
import { validate } from 'class-validator';
import { transporter } from "../config/mailer";

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
            const refresToken = jwt.sign({ userId: user.userId, username: user.username }, config.jwtSecretRefresh, { expiresIn: '1h' });

            user.refreshToken = refresToken;
            await userRepository.save(user);

            return res.json({ message: 'Bienvenido', token, refresToken, userId: user.userId, role: user.role });

        } catch (error) {
            return res.status(404).json({ message: "User not found", error })
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
            return res.status(400).json({ message: "Somenthing goes wrong!", error });
        }
    }

    static forgorPassword = async (req: Request, res: Response) => {

        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        try {
            let user: User;
            const userRepository = getRepository(User);
            user = await userRepository.findOneOrFail({ where: { username } });

            if (!user) {
                return res.status(400).json({ message: 'User not found' })
            }

            const msg = 'Check your email for a link to reset your password!'
            let verificationLink;
            let emailStatus = 'OK';

            const token = jwt.sign({ userId: user.userId, username: user.username, role: user.role }, config.jwtSecretReset, { expiresIn: '10m' });
            verificationLink = `http://localhost:4200/auth/new-password/${token}`;
            user.resetToken = token;

            //TODO SEND EMAIL
            await transporter.sendMail({
                from: '"Forgot password 👻" <guitarraviva18@gmail.com>',
                to: user.username,
                subject: "Hello Forgot password 👻",
                html: `
                <b>Please click on the following link, or paste this into your browser to complete the process:</b>
                <a href="${verificationLink}">${verificationLink}</a>
                `,
            })

            await userRepository.save(user);
            res.json({ message: msg, info: emailStatus })

        } catch (error) {
            return res.status(401).json({ message: "Somenthing goes wrong!", error });
        }
    }

    static createNewPassword = async (req: Request, res: Response) => {
        const { newPassword } = req.body;
        const resetToken = req.headers['reset'] as string;

        if (!resetToken && newPassword) {
            return res.status(400).json({ message: "All the fields are required" });
        }

        const userRepository = getRepository(User);
        let jwtPayload;
        let user: User;

        try {

            jwtPayload = jwt.verify(resetToken, config.jwtSecretReset);
            user = await userRepository.findOneOrFail({ where: { resetToken } });

        } catch (error) {
            return res.status(401).json({ message: "Somenthing goes wrong!", error });
        }

        user.password = newPassword;
        const validateOptions = { validationError: { target: false, value: false } };
        const errors = await validate(user, validateOptions);

        if (errors.length > 0) {
            return res.status(401).json(errors);
        }

        try {
            user.hashPassword();
            user.resetToken = '';
            await userRepository.save(user);
        } catch (error) {
            return res.status(401).json({ message: "Somenthing goes wrong!", error });
        }

        res.json({ message: 'Congratulation Changed Password!' })
    }

    static refreshToken = async (req: Request, res: Response) => {
        const refreshToken = req.headers['refresh'] as string;
        if (!refreshToken) {
            return res.status(400).json({ message: "All the fields are required" });
        }

        const userRepository = getRepository(User);
        let user: User;

        try {
            const verifyResult = jwt.verify(refreshToken, config.jwtSecretRefresh);
            const { username } = verifyResult as User;
            user = await userRepository.findOneOrFail({ where: { username } });

            const token = jwt.sign({ userId: user.userId, username: user.username }, config.jwtSecret, { expiresIn: '1h' });
            res.json({ message: 'ok token refresh', token });
        } catch (error) {
            return res.status(401).json({ message: "Somenthing goes wrong!", error });
        }
    }
}

export default AuthController;