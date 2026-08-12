FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY index.ts .

COPY src ./src

EXPOSE 4000

CMD [ "bun", "index.ts" ]