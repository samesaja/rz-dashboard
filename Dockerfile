# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# untuk Next.js App Router
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# copy output Next.js standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
# Next standalone butuh .next/static juga
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
