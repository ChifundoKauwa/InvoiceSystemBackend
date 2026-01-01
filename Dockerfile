# Multi-stage Dockerfile for Invoicing System Application
# Stage 1: Build (Compile TypeScript to JavaScript)
FROM node:20 AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev deps needed for build)
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Build the application (TypeScript → JavaScript)
RUN npm run build

# Stage 2: Production Runtime (Optimized image)
FROM node:20
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies (excludes dev dependencies)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Start the application in production mode
CMD ["node", "dist/main"]