# Use Node.js for both build and runtime
FROM node:23-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the production app
RUN npm run build:prod

# Expose Vite preview port
EXPOSE 4173

# Serve the app using vite preview
CMD ["npm", "run", "serve"]