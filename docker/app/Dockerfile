FROM node:14
WORKDIR /usr/src/app
COPY app/package*.json ./
RUN npm ci --only=production
COPY app .
CMD ["npm", "run", "start"]
