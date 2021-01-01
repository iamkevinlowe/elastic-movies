FROM node:14
WORKDIR /usr/src/app
COPY app/package*.json ./
RUN npm ci --only=production
COPY app .
EXPOSE 80
CMD ["npm", "run", "start"]
