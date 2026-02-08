import { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from "express";
import { UserModel } from "../models/user";
import { Request as ExpressJWTRequest } from "express-jwt";
import { SongModel } from "../models/song";
import * as fs from "node:fs";
import path from "node:path";

interface FatherJoke {
	setup: string;
	punchline: string;
}

class ResourceController {
	constructor() {}

	public async getRandomFatherJoke(): Promise<FatherJoke | null> {
		try {
			const response = await fetch("https://jokefather.com/api/jokes/random", {
				method: "GET",
				headers: {
					"Accept": "application/json"
				},
			});

			const response_json = await response.json();

			if (!response.ok) {
				return null;
			}

			return {
				"setup": response_json.setup,
				"punchline": response_json.punchline,
			};
		} catch (err) {
			return null;
		}
	}

	public async routeGetResource(req: ExpressJWTRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
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

		const songs = await SongModel.find({});

		await res.json({"message": "success", "data": songs, "joke": await this.getRandomFatherJoke()});
	}

	public async routeGetResourceById(req: ExpressJWTRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
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

		const id = req.params.id;

		if (typeof id != "string") {
			await res.status(400).json({"message": "id must be a valid ObjectId"})

			next();
			return;
		}

		const song = await SongModel.findById(id);

		if (song == null) {
			await res.status(404).json({"message": `resource with id ${id} not found`});

			next();
			return;
		}

		const metadata = await song.get_metadata();

		await res.json({"message": "success", "data": {"song": song, "metadata": metadata}, "joke": await this.getRandomFatherJoke()});
	}

	public async routePostResource(req: ExpressJWTRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
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

		const { name, artist, duration } = req.body;

		let song;

		try {
			song = await SongModel.create({ "name": name, "artist": artist });
		} catch (error) {
			await res.status(400);

			throw error;
		}

		await res.json({"message": "success", "data": song, "joke": await this.getRandomFatherJoke()});
	}

	public async routePutResource(req: ExpressJWTRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
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

		const id = req.params.id;

		if (typeof id != "string") {
			await res.status(400).json({"message": "id must be a valid ObjectId"})

			next();
			return;
		}

		const song = await SongModel.findById(id);

		if (song == null) {
			await res.status(404).json({"message": `resource with id ${id} not found`});

			next();
			return;
		}

		const { name, artist } = req.body;

		if (name == undefined && artist == undefined) {
			await res.status(400).json({"message": "at least one field must be provided"});

			next();
			return;
		}

		if (name != undefined) {
			song.name = name;
		}

		if (artist != undefined) {
			song.artist = artist;
		}

		await song.save();

		await res.json({"message": "success", "data": song, "joke": await this.getRandomFatherJoke()});
	}

	public async routePostResourceFile(req: ExpressJWTRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
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

		const id = req.params.id;

		if (typeof id != "string") {
			await res.status(400).json({"message": "id must be a valid ObjectId"})

			next();
			return;
		}

		const song = await SongModel.findById(id);

		if (song == null) {
			await res.status(404).json({"message": `resource with id ${id} not found`});

			next();
			return;
		}

		if (req.files == undefined) {
			await res.status(400).json({"message": "file must be provided"});

			next();
			return;
		}

		const file = Object.values(req.files)[0];

		if (file == undefined) {
			await res.status(400).json({"message": "file must be provided"});

			next();
			return;
		}

		if (Array.isArray(file)) {
			await res.status(400).json({"message": "file must be a single file"});

			next();
			return;
		}

		if (!file.mimetype.startsWith("audio/")) {
			await res.status(400).json({"message": "file must be an audio file"});

			next();
			return;
		}

		const extension = file.name.split(".").pop();

		if (extension == undefined) {
			await res.status(400).json({"message": "file must have an extension"});

			next();
			return;
		}

		const resources = path.join(__dirname, "..", "..", "static", "resources");

		if (!fs.existsSync(resources)) {
			fs.mkdirSync(resources);
		}

		file.mv(path.join(resources, `${song._id.toHexString()}.${extension}`));

		await res.json({"message": "success", "joke": await this.getRandomFatherJoke()});
	}

	public async routeDeleteResource(req: ExpressJWTRequest, res: ExpressResponse, next: NextFunction): Promise<void> {
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

		const id = req.params.id;

		if (typeof id != "string") {
			await res.status(400).json({"message": "id must be a valid ObjectId"})

			next();
			return;
		}

		const song = await SongModel.findById(id);

		if (song == null) {
			await res.status(404).json({"message": `resource with id ${id} not found`});

			next();
			return;
		}

		await song.deleteOne();

		await res.json({"message": "success", "joke": await this.getRandomFatherJoke()});
	}
}

declare global {
	var resourceController: ResourceController;
}

if (global.resourceController == undefined) {
	global.resourceController = new ResourceController();
}

export const resourceController = global.resourceController;