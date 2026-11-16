# Multi-Stage Dockerfile for Web Form Input Validation Engine

# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- Stage 2: Install Backend Dependencies ---
FROM node:20-alpine AS server-dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy server files and production dependencies
COPY server/ /app/server/
COPY --from=server-dependencies /app/server/node_modules /app/server/node_modules

# Copy built frontend assets into client/dist for unified serving
COPY --from=client-builder /app/client/dist /app/client/dist

EXPOSE 5000

CMD ["node", "server/server.js"]
