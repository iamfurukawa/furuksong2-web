# Build stage - only builds static files
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - serve static files with Node.js
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Create app directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 80
EXPOSE 80

# Start serve
CMD ["serve", "-s", "dist", "-l", "80"]
