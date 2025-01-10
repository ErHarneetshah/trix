# Use the official Node.js LTS image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy rest of the application code
COPY . .


# Run npm install (including dev dependencies)
RUN npm install
RUN npm install -g pm2

# Command to run your app using nodemon
CMD ["npx", "pm2-runtime", '--node-args="--max-old-space-size=4096"',"start" ,"app.js"  ]

