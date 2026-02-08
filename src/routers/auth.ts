import express from "express";
import { userController } from "../controllers/user";
import { checkSchema } from "express-validator";
import { validation_middleware } from "../middleware/validation";

export const router = express.Router();

router.post("/register", checkSchema({
	"email": {
		"in": "body",
		"isEmail": true,
		"exists": true,
	},
	"username": {
		"in": "body",
		"exists": true,
	},
	"password": {
		"in": "body",
		"exists": true,
	},
}), validation_middleware, userController.routePostRegister.bind(userController));

router.post("/login", checkSchema({
	"email": {
		"in": "body",
		"isEmail": true,
		"exists": true,
	},
	"password": {
		"in": "body",
		"exists": true,
	},
}), validation_middleware, userController.routePostLogin.bind(userController));

router.post("/logout", userController.routePostLogout.bind(userController));