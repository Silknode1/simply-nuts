# ── Stage 1: Development ──
FROM node:20-alpine AS development
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 5173 3000
CMD ["npm", "run", "dev:prototype"]

# ── Stage 2: Build ──
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:prototype

# ── Stage 3: Production ──
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/prototype-web/dist ./apps/prototype-web/dist
EXPOSE 3000
CMD ["npx", "serve", "-s", "apps/prototype-web/dist", "-l", "3000"]
