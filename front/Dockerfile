FROM node:22

ENV NODE_ENV=production
WORKDIR /srv/app

# Initial setup
RUN npm install -g pnpm
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --production=false
COPY --chown=node:node ./ ./

# Build app
RUN node_modules/.bin/next build

# Cleaning and pruning
RUN pnpm install --production --ignore-scripts --prefer-offline
RUN rm -r tsconfig.json src pnpm-lock.yaml next-env.d.ts .eslintrc.json .prettierrc

CMD node_modules/.bin/next start -p ${DEBUCK_FRONT_PORT}