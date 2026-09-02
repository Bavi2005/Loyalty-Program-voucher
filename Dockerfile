FROM node:20-alpine AS builder

WORKDIR /app

# Install root, backend, and frontend dependencies
COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

RUN npm ci --prefix backend && npm ci --prefix frontend && npm ci

# Copy application source
COPY . .

# IMPORTANT:
# Run Prisma from inside backend so it uses backend/node_modules/prisma
RUN cd backend && npx prisma generate

# Build frontend
RUN npm run build --prefix frontend


# ---- Runtime image ----
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/proxy.js ./proxy.js
COPY --from=builder /app/package.json ./package.json

# Reinstall backend production dependencies
RUN cd backend && npm ci --omit=dev

# Generate Prisma Client again after npm ci replaces backend/node_modules
RUN cd backend && npx prisma generate

RUN mkdir -p /app/backend/uploads && chown -R app:app /app

USER app

EXPOSE 8080

CMD ["node", "start.js"]
