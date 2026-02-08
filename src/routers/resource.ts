import express from "express";
import { resourceController } from "../controllers/resource";
import { checkSchema } from "express-validator";
import { auth_middleware } from "../middleware/auth";
import { validation_middleware } from "../middleware/validation";

export const router = express.Router();

router.get("/", auth_middleware, resourceController.routeGetResource.bind(resourceController));
router.get("/:id", auth_middleware, resourceController.routeGetResourceById.bind(resourceController));

router.post("/", auth_middleware, checkSchema({
	"name": {
		"in": "body",
		"exists": true,
	},
	"artist": {
		"in": "body",
		"exists": true,
	},
}), validation_middleware, resourceController.routePostResource.bind(resourceController));

router.put("/:id", auth_middleware, checkSchema({
	"name": {
		"in": "body",
		"optional": true,
	},
	"artist": {
		"in": "body",
		"optional": true,
	},
}), validation_middleware, resourceController.routePutResource.bind(resourceController));

router.post("/:id", auth_middleware, resourceController.routePostResourceFile.bind(resourceController));

router.delete("/:id", auth_middleware, resourceController.routeDeleteResource.bind(resourceController));