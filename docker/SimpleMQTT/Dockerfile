FROM node:18-slim

WORKDIR /app

# Copy only the necessary files
COPY package*.json ./
COPY dist/ ./dist/
COPY test-client.html ./

# Install only production dependencies
RUN npm install --production

# Install http-server
RUN npm install -g http-server

# Expose ports
EXPOSE 1883 8080 8000

# Start command
CMD ["sh", "-c", "http-server . -p 8000 & node ./dist/start-broker.js"]
