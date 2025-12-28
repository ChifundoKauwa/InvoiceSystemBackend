# Multi-stage Dockerfile for Invoicing System Application
# Stage 1: Build (Compile TypeScript to JavaScript)
FROM node:20 AS builder
WORKDIR /app

# Copy package files
COPY invoicing-system/package.json invoicing-system/package-lock.json ./

# Install ALL dependencies (including dev deps needed for build)
RUN npm ci

# Copy source code
COPY invoicing-system/src ./src
COPY invoicing-system/tsconfig*.json ./
COPY invoicing-system/nest-cli.json ./

# Build the application (TypeScript → JavaScript)
RUN npm run build

# Stage 2: Production Runtime (Optimized image)
FROM node:20
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only package files
COPY invoicing-system/package.json invoicing-system/package-lock.json ./

# Install ONLY production dependencies (excludes dev dependencies)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary files for runtime
COPY invoicing-system/.env.example .env.example

# Expose application port
EXPOSE 3000

# Health check to verify container is healthy
# Note: Checks root endpoint (/) which returns "Hello World!"
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application in production mode
CMD ["node", "dist/main"]