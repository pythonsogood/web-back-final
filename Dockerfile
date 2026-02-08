# deps
FROM node:25-slim AS deps
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# build
FROM deps AS build
COPY . .
RUN pnpm run build
RUN pnpm prune --prod

# runtime
FROM gcr.io/distroless/nodejs24-debian13

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

CMD [ "dist", "index.js" ]