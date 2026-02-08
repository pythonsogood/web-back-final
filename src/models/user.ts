import { HydratedDocument, Model, model, Schema } from "mongoose";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth";

const PASSWORD_HASH_OPTIONS: argon2.Options = {
	timeCost: 2,
	memoryCost: 19 * 1024,
	parallelism: 1,
	type: argon2.argon2id,
};

export interface IUser {
	username: string;
	email: string;
	password: string;
	gender: string;

	verify_password(password: string): Promise<boolean>;
	create_jwt(): Promise<string>;
}

export interface UserModelType extends Model<IUser> {
	hash_password(password: string): Promise<string>;
}

const userSchema = new Schema<IUser, UserModelType>({
	username: {type: String, required: true},
	email: {type: String, required: true, unique: true, validate: {
		validator: (email: string) => {
			return true;
		},
		message: "invalid email",
	}},
	password: {type: String, required: true},
	gender: {type: String, enum: ["unknown", "male", "female"], default: "unknown"},
}, {
	collection: "users",
	timestamps: true,
});

userSchema.static("hash_password", async function(password: string): Promise<string> {
	return await argon2.hash(password, PASSWORD_HASH_OPTIONS);
});

userSchema.method("verify_password", async function(password: string): Promise<boolean> {
	return await argon2.verify(this.password, password, PASSWORD_HASH_OPTIONS);
});

userSchema.method("create_jwt", async function(): Promise<string> {
	return jwt.sign({
		sub: this._id.toHexString(),
		exp: Date.now() / 1000 + 72 * 60 * 60,
		iss: "http://localhost",
	}, JWT_SECRET, {
		algorithm: "HS256",
	});
});

export const UserModel = model<IUser, UserModelType>("User", userSchema);

export type UserDocument = HydratedDocument<IUser>;