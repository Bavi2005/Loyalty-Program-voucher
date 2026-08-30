FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
COPY src ./src
COPY seed.js ./seed.js

RUN addgroup -S app && adduser -S app -G app \
  && mkdir -p uploads && chown -R app:app /app
USER app

EXPOSE 5000
# Apply migrations, seed (idempotent), start API
CMD ["sh", "-c", "npx prisma migrate deploy && node seed.js && node src/server.js"]
