# Build stage
FROM node:lts-alpine AS builder
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:lts-alpine AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /usr/src/app/dist ./dist

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Change ownership
RUN chown -R node /usr/src/app
USER node

# Start the application (with migrations)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
