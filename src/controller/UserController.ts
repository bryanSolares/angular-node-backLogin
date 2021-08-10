import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { validate } from "class-validator";
import User from "../entity/User";

class UserController {



    static getAll = async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        let users;

        try {
            users = await userRepository.find({ select: ['userId', 'username', 'role'] });
            if (users.length > 0) {
                res.json(users);
            } else {
                return res.status(404).json({ message: "No results." });
            }
        } catch (error) {
            console.error(error);
            return res.status(404).json({ message: "Not Result." });
        }

    }

    static getUserById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const userRepository = getRepository(User);

        try {
            const user = await userRepository.findOneOrFail(id, { select: ['userId', 'username', 'role'] });
            res.json(user);
        } catch (error) {
            console.error(error);
            return res.status(404).json({ message: "Not Result." });
        }
    }

    static newUser = async (req: Request, res: Response) => {
        const { username, password, role } = req.body;
        const user = new User();

        user.username = username;
        user.password = password;
        user.role = role;
        user.resetToken = '';
        user.refreshToken = '';

        const validationOptions = { validationError: { target: false, value: false } };
        const errors = await validate(user, validationOptions);
        if (errors.length > 0) {
            return res.status(400).json(errors);
        }

        const userRepository = getRepository(User);
        try {
            user.hashPassword();
            await userRepository.save(user);
            res.json({ message: 'User created.' });
        } catch (error) {
            console.error(error);
            return res.status(409).json({ message: "Username already exist" });
        }
    }

    static editUserById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { username, role } = req.body;
        let user: User;

        const userRepository = getRepository(User);
        try {
            user = await userRepository.findOneOrFail(id);
            user.username = username;
            user.role = role;
        } catch (error) {
            console.error(error);
            return res.status(404).json({ message: "User not exists" });
        }

        try {
            const validationOptions = { validationError: { target: false, value: false } };
            const errors = await validate(user, validationOptions);
            if (errors.length > 0) {
                return res.status(400).json(errors);
            }

            await userRepository.save(user);
            res.json({ message: 'User updated.' });
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "User already in use" });
        }
    }

    static deletUserById = async (req: Request, res: Response) => {
        const { id } = req.params;
        let user: User;

        const userRepository = getRepository(User);
        try {
            user = await userRepository.findOneOrFail(id);

            await userRepository.remove(user);
            res.status(201).json({ message: 'User removed.' });
        } catch (error) {
            console.error(error);
            return res.status(404).json({ message: "User not found" });
        }
    }

}

export default UserController;

