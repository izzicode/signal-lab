FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
COPY apps/backend/package.json ./
RUN npm install

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend/ .
COPY prisma/ ./prisma/
RUN npx prisma generate --schema=./prisma/schema.prisma
COPY apps/backend/seed.js ./seed.js
COPY apps/backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start:dev"]
