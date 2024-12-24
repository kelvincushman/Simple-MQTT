FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose MQTT ports
EXPOSE 1883
EXPOSE 8080

# Start the broker
CMD ["node", "./dist/start-broker.js"]
