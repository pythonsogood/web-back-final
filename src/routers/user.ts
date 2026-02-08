import express from "express";
import { userController } from "../controllers/user";
import { checkSchema } from "express-validator";
import { auth_middleware } from "../middleware/auth";
import { validation_middleware } from "../middleware/validation";

export const router = express.Router();

router.get("/profile", auth_middleware, userController.routeGetProfile.bind(userController));

router.put("/profile", auth_middleware, checkSchema({
	"gender": {
		"in": "body",
		"exists": true,
	},
}), validation_middleware, userController.routePutProfile.bind(userController));