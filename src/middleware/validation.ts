import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const validation_middleware = async (req: Request, res: Response, next: NextFunction) => {
	const validation_result = validationResult(req);

	if (!validation_result.isEmpty()) {
		await res.status(400);

		throw new Error(JSON.stringify(validation_result.array()));
	}

	next();
};