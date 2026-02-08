import { connect } from "mongoose";

export async function configure(): Promise<void> {
	await connect(process.env.MONGODB_URI);
}