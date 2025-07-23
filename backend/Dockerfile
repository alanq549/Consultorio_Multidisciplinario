# Etapa de construcción
FROM node:20 AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Copia prisma
COPY prisma ./prisma

# Genera prisma client con target para Alpine (linux-musl-openssl-3.0.x)
RUN npx prisma generate

# Copia el resto del código
COPY . .
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS prod
WORKDIR /app

COPY --from=build /app ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]
