install: uninstall
	@docker-compose -f docker/docker-compose.dev.yml build

up: down
	@docker-compose -f docker/docker-compose.dev.yml up

prod: prod-down
	@docker-compose -f docker/docker-compose.yml up

build:
	@docker-compose -f docker/docker-compose.yml build --pull app worker
	@docker-compose -f docker/docker-compose.yml push app worker

down:
	@docker-compose -f docker/docker-compose.dev.yml down

prod-down:
	@docker-compose -f docker/docker-compose.yml down

uninstall:
	@docker-compose -f docker/docker-compose.dev.yml down --rmi all
