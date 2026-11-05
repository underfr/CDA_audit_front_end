# Étape 1 : compile l'application
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install --global pnpm@11.24.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# --prod : ni Cypress, ni Playwright, ni Lighthouse dans l'image
# --ignore-scripts : le postinstall (nuxt prepare) a besoin des sources, copiées juste après
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY . .
RUN pnpm build

# Étape 2 : image finale, avec uniquement le serveur compilé
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO /dev/null "http://127.0.0.1:${PORT:-3000}/login" || exit 1
CMD ["node", ".output/server/index.mjs"]