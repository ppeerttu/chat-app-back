FROM node:8.5.0-alpine

WORKDIR /var/app

COPY package.json .
COPY package-lock.json .

RUN npm install --quiet
RUN npm cache verify
