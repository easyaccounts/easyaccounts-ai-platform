# STEP 1: Build the React app
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# STEP 2: Serve the app with NGINX
FROM nginx:stable-alpine

# Patch default config to use port 8080 (Cloud Run default)
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
