FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /srv/app

# Initial setup
RUN npm install -g pnpm
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node prisma/ ./prisma/
RUN pnpm install --frozen-lockfile --production=false
COPY --chown=node:node ./ ./

# Build app
RUN pnpm prisma generate
RUN pnpm build

# Cleaning and pruning
RUN pnpm install --production --ignore-scripts --prefer-offline
RUN rm -r tsconfig.json prisma src pnpm-lock.yaml

CMD pnpm start:prod