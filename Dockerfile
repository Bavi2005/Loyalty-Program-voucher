FROM node:20-alpine AS builder
WORKDIR /app

# Install root (proxy) + backend + frontend dependencies
COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

RUN npm ci --prefix backend && npm ci --prefix frontend && npm ci

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=backend/prisma/schema.prisma

# Build frontend
RUN npm run build --prefix frontend

# ---- Runtime image ----
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Non-root user
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/proxy.js ./proxy.js
COPY --from=builder /app/package.json ./package.json

# Install only production deps in backend runtime
RUN cd backend && npm ci --omit=dev

RUN mkdir -p /app/backend/uploads && chown -R app:app /app
USER app

EXPOSE 8080
CMD ["node", "proxy.js"]
