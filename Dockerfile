#  Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./


RUN npm ci

COPY . .

RUN npm run build

# Production Stage
FROM node:18-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/src/app/config ./src/app/config

RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 5005

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5005/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server.js"]
