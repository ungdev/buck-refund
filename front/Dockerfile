FROM node:22

ENV NODE_ENV=production
WORKDIR /srv/app

ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_API_VERSION=v1
ARG NEXT_PUBLIC_API_REQUEST_TIMEOUT=1000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_VERSION=$NEXT_PUBLIC_API_VERSION
ENV NEXT_PUBLIC_API_REQUEST_TIMEOUT=$NEXT_PUBLIC_API_REQUEST_TIMEOUT

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
