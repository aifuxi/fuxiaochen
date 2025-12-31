# Dockerfile

# 1. Builder Stage: Build the Next.js application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application source code
COPY . .

# Generate Prisma Client
RUN pnpm db:gen

# Copy .env for build process
COPY .env ./

# Build the application
RUN pnpm build

# 2. Runner Stage: Create the final image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
# Copy the public folder
COPY --from=builder /app/public ./public
# Copy the static assets
COPY --from=builder /app/.next/static ./.next/static
# Copy the prisma folder for database access
COPY --from=builder /app/prisma ./prisma

# Expose the port the app runs on
EXPOSE 3000

# Set the environment variable for the port
ENV PORT 3000

# Command to run the application
CMD ["node", "server.js"]
