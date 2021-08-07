import { Router } from "express";
import AuthController from "../controller/AuthController";
import { checkJwt } from '../middleware/jwt';

const routes = Router();

routes.post("/login", AuthController.login);
routes.post("/change-password", [checkJwt], AuthController.changePassword);
routes.put("/forgot-password", AuthController.forgorPassword);
routes.put("/new-password", AuthController.createNewPassword);

export default routes;