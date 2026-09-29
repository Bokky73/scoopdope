# Production image for the backend API.
#
# Static assets are NOT served by the Node.js/Express app in production
# (see issue #1032). They are served by a CDN or nginx in front of this
# container, so this image only needs to run the API server.

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies (production only)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

ENV NODE_ENV=production

# The Express app must not serve static files in production; assets are
# handled by the CDN/nginx reverse proxy. Expose only the API port.
EXPOSE 3000

CMD ["node", "dist/index.js"]
