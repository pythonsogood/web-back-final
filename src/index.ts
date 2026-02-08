import path from "node:path";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { router as authRouter } from "./routers/auth";
import { router as userRouter } from "./routers/user";
import { router as resourceRouter } from "./routers/resource";
import * as db from "./config/db";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MONGODB_URI: string;
			PORT: string;
			JWT_SECRET: string;
		}
	}
}

const APP_PORT = parseInt(process.env.PORT);

const app = express();

app.set("trust proxy", true);

app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/resources", express.static(path.join(__dirname, "..", "static", "resources")));

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
	limits: {
		fileSize: 10 * 1024 * 1024,
	},
}));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/resources", resourceRouter);

app.use(async (err: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
	console.log(err.stack);

	await res.status(res.statusCode >= 400 && res.statusCode < 600 ? res.statusCode : 500).json({"message": err.message});
});

app.listen(APP_PORT, async () => {
	await db.configure();

	console.log(`Server is running on port ${APP_PORT}`);
});

export default app;