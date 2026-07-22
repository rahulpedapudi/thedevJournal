FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/

RUN bun install --frozen-lockfile

COPY apps/api ./apps/api

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["bun", "src/index.ts"]