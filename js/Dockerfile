FROM node:bullseye-slim

# install pnpm
RUN npm install -g pnpm

WORKDIR /app
COPY . .
RUN pnpm install

EXPOSE 4000
CMD [ "npm", "run", "start:server" ]