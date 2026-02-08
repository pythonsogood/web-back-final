import { HydratedDocument, Model, model, Schema } from "mongoose";
import { parseFile } from 'music-metadata';
import path from "node:path";
import * as fs from "node:fs";

export interface SongMetadata {
	duration?: number;
	bitrate?: number;
	filename: string;
}

export interface ISong {
	name: string;
	artist: string;

	get_metadata(): Promise<SongMetadata | null>;
}

export interface SongModelType extends Model<ISong> {}

const songSchema = new Schema<ISong, SongModelType>({
	name: {type: String, required: true},
	artist: {type: String, required: true},
}, {
	collection: "songs",
	timestamps: true,
});

songSchema.method("get_metadata", async function(): Promise<SongMetadata | null> {
	const resources = path.join(__dirname, "..", "..", "static", "resources");

	if (!fs.existsSync(resources)) {
		return null;
	}

	const id_hex = this._id.toHexString();

	const filename = fs.readdirSync(resources).find((filename) => filename.startsWith(id_hex));

	if (filename == undefined) {
		return null;
	}

	const filepath = path.join(resources, filename);

	if (!fs.existsSync(filepath)) {
		return null;
	}

	const metadata = await parseFile(filepath, {
		duration: true,
		skipCovers: true,
		skipPostHeaders: true,
		includeChapters: false,
	});

	return {
		duration: metadata.format.duration,
		bitrate: metadata.format.bitrate,
		filename: filename,
	};
});

export const SongModel = model<ISong, SongModelType>("Song", songSchema);

export type SongDocument = HydratedDocument<ISong>;