FROM node:bullseye-slim

# install pnpm
RUN npm install -g pnpm

WORKDIR /app
COPY . .

# install ffmpeg static
RUN apt update && apt install curl xz-utils -y
RUN bash ./install-ffmpeg.sh

RUN pnpm install
RUN npx playwright install-deps

EXPOSE 4000
CMD [ "npm", "run", "start:server" ]