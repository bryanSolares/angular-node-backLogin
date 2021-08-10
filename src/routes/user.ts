import { Router } from "express";
import UserController from '../controller/UserController';
import { checkJwt } from '../middleware/jwt';
import { checkRole } from '../middleware/role';

const routes = Router();

routes.get("/all-users", /*[checkJwt, checkRole(['ADMIN_ROLE'])],*/ UserController.getAll);
routes.get("/:id", /*[checkJwt, checkRole(['ADMIN_ROLE'])],*/ UserController.getUserById);
routes.post("/new-user", /*[checkJwt, checkRole(['ADMIN_ROLE'])],*/ UserController.newUser);
routes.patch("/edit-user/:id", /*[checkJwt, checkRole(['ADMIN_ROLE'])],*/ UserController.editUserById);
routes.delete("/delete/:id", /*[checkJwt, checkRole(['ADMIN_ROLE'])],*/ UserController.deletUserById);

export default routes;