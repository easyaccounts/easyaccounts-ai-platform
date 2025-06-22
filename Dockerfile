# Use official Node image
FROM node:18

# Create app directory
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files
COPY dist /app/dist

# Use serve to host dist folder
CMD ["serve", "-s", "dist", "-l", "8080"]
