# --- Build stage ---
FROM node:22-slim AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

# --- Runtime stage ---
FROM node:22-slim
WORKDIR /app

# Copy built app from build stage
COPY --from=build /app /app

# Expose API port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
