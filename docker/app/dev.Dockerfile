FROM node:14
WORKDIR /usr/src/app
COPY app/package*.json ./
RUN npm install
COPY app .
EXPOSE 80
CMD ["npm", "run", "start:dev"]
