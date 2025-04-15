FROM node:18

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY app.js ./
COPY public ./public

EXPOSE 3000

CMD ["node", "app.js"] 