import { Router } from "express";
import AuthController from "../controller/AuthController";
import { checkJwt } from '../middleware/jwt';

const routes = Router();

routes.post("/login", AuthController.login);
routes.post("/change-password", [checkJwt], AuthController.changePassword);

export default routes;