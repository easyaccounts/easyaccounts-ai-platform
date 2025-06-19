# 1) Build your Vite React app into /app/dist
FROM node:18-alpine AS builder
WORKDIR /app
# Copy package files and install deps
COPY package*.json tsconfig*.json ./
RUN npm ci

# Copy all source & build
COPY . .
RUN npm run build

# 2) Serve the dist folder with Nginx on port 8080
FROM nginx:stable-alpine
# Patch default.conf to listen on 8080 instead of 80
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

# Copy the built site into the Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Tell Docker & Cloud Run that we listen on 8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
