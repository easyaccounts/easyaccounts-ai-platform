# ======================
# Stage 1: Build the app
# ======================
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# =============================
# Stage 2: Serve the built app
# =============================
FROM node:18

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

CMD ["serve", "-s", "dist", "-l", "8080"]
