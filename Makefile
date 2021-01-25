install: uninstall
	@docker-compose -f docker/docker-compose.dev.yml build

up: down
	@docker-compose -f docker/docker-compose.dev.yml up

down:
	@docker-compose -f docker/docker-compose.dev.yml down

uninstall:
	@docker-compose -f docker/docker-compose.dev.yml down --rmi all
