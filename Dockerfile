FROM node:lts-alpine
WORKDIR /app
COPY package.json ./
COPY . .
EXPOSE 3000
CMD npm run start
