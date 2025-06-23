# ======================
# Stage 1: Build the app
# ======================
FROM node:18 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# =============================
# Stage 2: Serve the built app
# =============================
FROM node:18

WORKDIR /app
RUN npm install -g serve

# Copy build output from stage 1
COPY --from=builder /app/dist ./dist

# Serve app
CMD ["serve", "-s", "dist", "-l", "8080"]
