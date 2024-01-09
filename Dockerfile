FROM node:18-alpine as builder

#######################################################################
WORKDIR /app

COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

#######################################################################
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/package*.json .
COPY --from=builder /app/dist .
COPY --from=builder /app/node_modules ./node_modules/

ENV NODE_ENV production

CMD [ "npm", "run", "start" ]
