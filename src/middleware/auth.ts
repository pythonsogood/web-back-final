import { expressjwt, TokenGetter } from "express-jwt";
import { JWT_SECRET } from "../config/auth";
import { Request, RequestHandler } from "express";

export const auth_middleware = global.auth_middleware ?? expressjwt({
	secret: JWT_SECRET,
	algorithms: ["HS256"],
	issuer: "http://localhost",
	getToken: (async (req: Request): Promise<string | undefined> => {
		if (req.headers.authorization) {
			const authorization_split = req.headers.authorization.split(" ");

			if (authorization_split[0] == "Bearer") {
				return authorization_split[1];
			}
		}

		if (req.cookies["Authorization-Token"]) {
			return req.cookies["Authorization-Token"];
		}

		return undefined;
	}) as TokenGetter,
});

declare global {
	var auth_middleware: RequestHandler;
}

if (global.auth_middleware == undefined) {
	global.auth_middleware = auth_middleware;
}