# Use Node.js LTS version as base image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Install `serve` to serve the Next.js production build
RUN npm install -g serve

# Use a minimal image to serve the app
FROM alpine:3.17

# Set environment variables
ENV NODE_ENV=production

# Install required dependencies
RUN apk add --no-cache nodejs

# Copy built app from builder stage
COPY --from=builder /app /app

# Set working directory
WORKDIR /app

# Expose port 3000
EXPOSE 3000

# Start the Next.js production build
CMD ["serve", "-s", "out", "-l", "3000"]
