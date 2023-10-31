FROM node:20-alpine as builder

#######################################################################
WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build
RUN npm prune --production

#######################################################################
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/package*.json .
COPY --from=builder /app/dist .
COPY --from=builder /app/node_modules .

ENV NODE_ENV production

CMD [ "npm", "run", "start" ]
