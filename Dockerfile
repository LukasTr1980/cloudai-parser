# Base image to install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci

# Build stage: copy everything, install dependencies and build the app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy entire project
COPY . .

# Copy installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Install dependencies required for building
RUN npm ci

# Build the Next.js application
RUN npm run build

# Production stage: minimal image for running the app
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy the built application and node_modules from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port that the Next.js application runs on
EXPOSE 3000

# Command to run the Next.js application in production
CMD ["npm", "run", "start"]
