FROM node:9.1.0-alpine

WORKDIR /var/app

COPY package.json .
COPY package-lock.json .

RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm install --quiet
RUN npm rebuild bcrypt --build-from-source
RUN npm cache verify

COPY . .
