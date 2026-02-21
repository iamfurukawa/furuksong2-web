# Build stage - only builds static files
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy built files to app directory for volume mount
RUN cp -r dist /app/dist
