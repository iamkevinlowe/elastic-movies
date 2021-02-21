FROM iamkevinlowe/elastic-movies_app:latest
EXPOSE 9000
CMD ["npm", "run", "worker:dev"]
