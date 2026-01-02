# Makefile

# This Makefile is used to build and run the ft_transcendence project using Docker.

.PHONY: all build up down logs clean re

all: build up

build:
	cd srcs && docker compose up --build -d

up:
	cd srcs && docker compose up -d

down:
	cd srcs && docker compose down

logs:
	cd srcs && docker compose logs -f

clean:
	cd srcs && docker compose down -v
	docker system prune -af

re: clean all