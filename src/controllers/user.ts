import { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from "express";
import { UserModel } from "../models/user";
import { Request as ExpressJWTRequest } from "express-jwt";

class UserController {
	constructor() {}

	public async routePostRegister(req: ExpressRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
		const { username, email, password } = req.body;

		let user;

		try {
			user = await UserModel.create({ "username": username, "email": email, "password": await UserModel.hash_password(password) });
		} catch (error) {
			await res.status(400);

			throw error;
		}

		await user.save();

		const token = await user.create_jwt();

		res.cookie("Authorization-Token", token);

		await res.json({"message": "success", "data": token});
	}

	public async routePostLogin(req: ExpressRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
		const { email, password } = req.body;

		const user = await UserModel.findOne({ "email": email });

		if (user == null || !await user.verify_password(password)) {
			await res.status(401).json({"message": "invalid credentials"});

			next();
			return;
		}

		const token = await user.create_jwt();

		res.cookie("Authorization-Token", token);

		await res.json({"message": "success", "data": token});
	}

	public async routePostLogout(req: ExpressRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
		res.clearCookie("Authorization-Token");

		await res.json({"message": "success"});
	}

	public async routeGetProfile(req: ExpressJWTRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
		if (req.auth == undefined) {
			await res.status(401).json({"message": "not logged in"});

			next();
			return;
		}

		const user = await UserModel.findById(req.auth.sub);

		if (user == null) {
			await res.status(404).json({"message": "user not found"});

			next();
			return;
		}

		await res.json({"message": "success", "data": {"username": user.username, "email": user.email, "gender": user.gender}});
	}

	public async routePutProfile(req: ExpressJWTRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
		if (req.auth == undefined) {
			await res.status(401).json({"message": "not logged in"});

			next();
			return;
		}

		const user = await UserModel.findById(req.auth.sub);

		if (user == null) {
			await res.status(404).json({"message": "user not found"});

			next();
			return;
		}

		const { gender } = req.body;

		user.gender = gender;

		await user.save();

		await res.json({"message": "success"});
	}
}

declare global {
	var userController: UserController;
}

if (global.userController == undefined) {
	global.userController = new UserController();
}

export const userController = global.userController;