FROM node:25.8.0-alpine AS builder

WORKDIR /app

ENV NUXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json face-sdk-postinstall.cjs ./
RUN npm ci

COPY . .
RUN npm run generate

FROM nginx:alpine AS runner

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/.output/public /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
