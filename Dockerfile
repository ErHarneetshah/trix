# Use official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN bun install

# Copy all other project files
COPY . .

# Copy the .env file to the container
COPY .env .env

# Expose the ports for the app and sockets
EXPOSE 3090
EXPOSE 3091
EXPOSE 3092

# Set environment variables from the .env file
# ENV PORT=3000
# ENV SOCKET_PORT=3001
# ENV ADMIN_SOCKET_PORT=3002

# Command to run your app
CMD ["bun", "run", "./src/server.ts"]
