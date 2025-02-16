FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
# Install deps
RUN npm ci

# Copy entire project
COPY . .

# Optional: If you want to run tests on build, do so here
# RUN npm run build

# Expose or define entrypoint
CMD ["npm", "run", "test:ui:ai"]
