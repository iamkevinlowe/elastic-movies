FROM node:14
WORKDIR /usr/src/worker
COPY app/package*.json ./
RUN npm ci --only=production
COPY app .
EXPOSE 9000
CMD ["npm", "run", "worker"]
