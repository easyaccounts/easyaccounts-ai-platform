# STEP 1: Build your Vite React app
FROM node:18-alpine AS builder
WORKDIR /app

# Copy deps and install
COPY package*.json ./
RUN npm ci

# Copy source and build it
COPY . .
RUN npm run build

# STEP 2: Serve with NGINX on port 8080
FROM nginx:stable-alpine

# Patch nginx config to listen on port 8080
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

# Copy built files to nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
