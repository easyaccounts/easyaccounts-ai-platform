# 1) Build the Vite React app
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source & build
COPY . .
RUN npm run build    # assumes this outputs into ./dist

# 2) Serve the dist folder with Nginx on port 8080
FROM nginx:stable-alpine

# Patch Nginx to listen on 8080 instead of 80
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

# Copy the built site into Nginx’s html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port Cloud Run expects
EXPOSE 8080

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
