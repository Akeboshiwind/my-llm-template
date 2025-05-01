FROM oven/bun:latest

WORKDIR /app

# Install dependencies
COPY package.json .
RUN bun install

# Copy source code
COPY . .

# Create database directory
RUN mkdir -p ./data

# Setup and seed the database
RUN bun run db:setup
RUN bun run db:seed

# Set environment variables
ENV PORT=3000
ENV DB_PATH=./data/database.sqlite

# Expose the port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]