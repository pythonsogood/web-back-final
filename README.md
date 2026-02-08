# Final Project: Music Player

Backend TypeScript web application built with [express](https://github.com/expressjs/express).

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/license/mit/)

## Features

* Password hashing using Argon2id algorithm, recommended by [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
* [JWT](https://www.jwt.io/)-based authentication, either with `Authorization: Bearer TOKEN` header or `Authorization-Token: TOKEN` cookie (via [cookie-parser](https://github.com/expressjs/cookie-parser) middleware)
* [Validator.js](https://express-validator.github.io/docs) powered requests validation
* MongoDB Object Document Mapper powered by [Mongoose](https://mongoosejs.com/)
* Father Jokes in resources endpoints via [JokeFather](https://jokefather.com/)
* Resource file uploading via [express-fileupload](express-fileupload)
* Music metadata (duration, bitrate) parsing through [music-metadata](https://github.com/Borewit/music-metadata)
* Appropriate global error handling middleware
* Environment variables to store sensitive information

## Installation

install [node.js](https://nodejs.org/en/download/)

install [pnpm](https://pnpm.io/installation)

install dependencies

```sh
pnpm install
```

create a `.env` file

```env
MONGODB_URI=your_mongodb_uri
PORT=port
JWT_SECRET=jwt_secret
```

## Usage

build

```sh
pnpm build
```

run `dist/index.js`

```sh
pnpm start
```
or
```sh
node dist/index.js
```

## API Documentation

### Auth

#### Register

Endpoint

```
POST /api/auth/register
```

Request Body

```json
{
	"email": string,
	"username": string,
	"password": string
}
```

Response Model

```json
{
	"message": string,
	"data": string // JWT token
}
```

#### Login

Endpoint

```
POST /api/auth/login
```

Request Body

```json
{
	"email": string,
	"password": string
}
```

Response Model

```json
{
	"message": string,
	"data": string // JWT token
}
```

#### Logout

Endpoint

```
POST /api/auth/logout
```

Response Model

```json
{
	"message": string
}
```

### Users

#### Get Profile

Endpoint

```
GET /api/users/profile
```

Response Model:

```json
{
	"message": string,
	"data": {
		"username": string,
		"email": string,
		"gender": string
	}
}
```

#### Update Profile

Endpoint

```
PUT /api/users/profile
```

Request Body

```json
{
	"gender": "unknown" | "male" | "female",
}
```

Response Model:

```json
{
	"message": string
}
```

### Resources

#### Get All Resources

Endpoint

```
GET /api/resources
```

Response Model:

```json
{
	"message": string,
	"data": [
		{
			"_id": string,
			"name": string,
			"artist": string
		}
	],
	"joke": {
		"setup": string,
		"punchline": string
	}
}
```

#### Get Resource

Endpoint

```
GET /api/resources/:id
```

Response Model:

```json
{
	"message": string,
	"data": {
		"song": {
			"_id": string,
			"name": string,
			"artist": string
		},
		"metadata": {
			"duration": number?,
			"bitrate": number?,
			"filename": string
		}
	},
	"joke": {
		"setup": string,
		"punchline": string
	}
}
```

#### Post Resource

Endpoint

```
POST /api/resources
```

Request Body

```json
{
	"name": string,
	"artist": string
}
```

Response Model:

```json
{
	"message": string,
	"data": {
		"_id": string,
		"name": string,
		"artist": string
	},
	"joke": {
		"setup": string,
		"punchline": string
	}
}
```

#### Update Resource

Endpoint

```
PUT /api/resources/:id
```

Request Body

```json
{
	"name": string?,
	"artist": string?
}
```

Response Model:

```json
{
	"message": string,
	"data": {
		"_id": string,
		"name": string,
		"artist": string
	},
	"joke": {
		"setup": string,
		"punchline": string
	}
}
```

#### Set Resource File

Endpoint

```
POST /api/resources/:id
```

Request Body: upload a single file

Response Model:

```json
{
	"message": string,
	"joke": {
		"setup": string,
		"punchline": string
	}
}
```

#### Delete Resource

Endpoint

```
DELETE /api/resources/:id
```

Response Model:

```json
{
	"message": string,
	"joke": {
		"setup": string,
		"punchline": string
	}
}
```
