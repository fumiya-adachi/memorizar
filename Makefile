.PHONY: up down build restart logs ps studio migrate deploy generate format db shell

up:
	docker compose up -d

build:
	docker compose up --build -d

down:
	docker compose down

restart:
	docker compose down
	docker compose up -d

logs:
	docker compose logs -f

ps:
	docker compose ps

studio:
	docker compose exec next npx prisma studio --port 5555 --browser none

migrate:
	docker compose exec next npx prisma migrate dev --name $(name)

deploy:
	docker compose exec next npx prisma migrate deploy

generate:
	docker compose exec next npx prisma generate

format:
	docker compose exec next npx prisma format

db:
	docker compose exec db psql -U postgres -d memorizar

shell:
	docker compose exec next sh