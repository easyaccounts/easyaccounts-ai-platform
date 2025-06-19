# 1. Build your React UI
FROM node:18-alpine AS builder
WORKDIR /app
COPY ui/package*.json ui/
RUN cd ui && npm ci
COPY ui/ ui/
RUN cd ui && npm run build

# 2. Serve with NGINX, but listen on 8080
FROM nginx:stable-alpine
# patch default.conf to use 8080
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf
COPY --from=builder /app/ui/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
