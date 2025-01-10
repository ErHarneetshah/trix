# Use the official Node.js LTS image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install both production and dev dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

# Copy the rest of the application code
COPY . .

# Command to run your app using PM2
CMD ["pm2-runtime", "--node-args=--max-old-space-size=4096", "start", "app.js"]
