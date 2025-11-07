FROM oven/bun:alpine AS base


FROM base AS builder
RUN apk add --no-cache libc6-compat

RUN apk update
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install

FROM base AS installer

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . . 

RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_NODE_ENV=production



COPY --from=installer /app/public ./public
COPY --from=installer /app/.next/standalone ./
COPY --from=installer /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000


CMD HOSTNAME="0.0.0.0" bun run server.js
