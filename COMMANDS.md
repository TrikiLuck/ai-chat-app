# Быстрые команды для управления AI Chat App

## Деплой и запуск

```bash
# Первый деплой
./deploy.sh

# Или вручную
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
```

## Управление сервисами

```bash
# Просмотр статуса
docker compose ps

# Просмотр логов (все сервисы)
docker compose logs -f

# Просмотр логов конкретного сервиса
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Перезапуск всех сервисов
docker compose restart

# Перезапуск конкретного сервиса
docker compose restart backend
docker compose restart frontend

# Остановка
docker compose stop

# Запуск
docker compose start

# Полная остановка с удалением контейнеров
docker compose down

# Остановка с удалением volumes (УДАЛИТ ВСЕ ДАННЫЕ!)
docker compose down -v
```

## Резервное копирование

```bash
# Создать бэкап
./backup.sh

# Восстановить из бэкапа
./restore.sh

# Ручное создание бэкапа
docker compose exec postgres pg_dump -U postgres ai_chat_app > backup.sql

# Ручное восстановление
docker compose exec -T postgres psql -U postgres ai_chat_app < backup.sql
```

## Обновление приложения

```bash
# Автоматическое обновление
./update.sh

# Или вручную
git pull
docker compose down
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
```

## Работа с базой данных

```bash
# Подключиться к PostgreSQL
docker compose exec postgres psql -U postgres -d ai_chat_app

# Выполнить SQL запрос
docker compose exec postgres psql -U postgres -d ai_chat_app -c "SELECT * FROM users;"

# Сбросить базу данных (УДАЛИТ ВСЕ ДАННЫЕ!)
docker compose exec backend npx prisma migrate reset

# Применить миграции
docker compose exec backend npx prisma migrate deploy

# Создать новую миграцию
docker compose exec backend npx prisma migrate dev --name migration_name

# Открыть Prisma Studio (GUI для БД)
docker compose exec backend npx prisma studio
```

## Отладка

```bash
# Войти в контейнер backend
docker compose exec backend sh

# Войти в контейнер frontend
docker compose exec frontend sh

# Проверить переменные окружения backend
docker compose exec backend env

# Проверить здоровье backend
curl http://localhost:3001/health

# Проверить frontend
curl http://localhost:8080

# Проверить использование ресурсов
docker stats

# Проверить размер контейнеров
docker system df
```

## Очистка

```bash
# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка Docker
docker system prune -a --volumes

# Очистка логов
truncate -s 0 $(docker inspect --format='{{.LogPath}}' ai-chat-backend)
truncate -s 0 $(docker inspect --format='{{.LogPath}}' ai-chat-frontend)
truncate -s 0 $(docker inspect --format='{{.LogPath}}' ai-chat-postgres)
```

## Мониторинг

```bash
# Просмотр использования ресурсов в реальном времени
docker stats

# Проверка дискового пространства
df -h

# Размер директории uploads
du -sh backend/uploads

# Количество пользователей
docker compose exec postgres psql -U postgres -d ai_chat_app -c "SELECT COUNT(*) FROM users;"

# Количество чатов
docker compose exec postgres psql -U postgres -d ai_chat_app -c "SELECT COUNT(*) FROM chats;"

# Количество сообщений
docker compose exec postgres psql -U postgres -d ai_chat_app -c "SELECT COUNT(*) FROM messages;"
```

## Безопасность

```bash
# Изменить JWT_SECRET
nano .env
# Измените JWT_SECRET, затем:
docker compose restart backend

# Изменить пароль PostgreSQL
nano .env
# Измените POSTGRES_PASSWORD, затем:
docker compose down
docker volume rm ai-chat-app_postgres_data
docker compose up -d
docker compose exec backend npx prisma migrate deploy

# Проверить открытые порты
sudo netstat -tulpn | grep -E ':(80|443|3001|5432|8080)'

# Настроить firewall (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Производительность

```bash
# Оптимизация PostgreSQL
docker compose exec postgres psql -U postgres -d ai_chat_app -c "VACUUM ANALYZE;"

# Очистка старых логов Docker
sudo sh -c "truncate -s 0 /var/lib/docker/containers/*/*-json.log"

# Ограничение размера логов (добавить в docker-compose.yml)
# logging:
#   driver: "json-file"
#   options:
#     max-size: "10m"
#     max-file: "3"
```

## Автоматизация

```bash
# Добавить в crontab для автоматических бэкапов
crontab -e

# Добавить строку (бэкап каждый день в 2:00 ночи)
0 2 * * * cd /path/to/ai-chat-app && ./backup.sh >> /var/log/ai-chat-backup.log 2>&1

# Автоматическая очистка старых бэкапов (каждую неделю)
0 3 * * 0 find /path/to/ai-chat-app/backups -name "backup_*.sql.gz" -mtime +30 -delete
```

## Troubleshooting

```bash
# Backend не запускается
docker compose logs backend
docker compose exec backend npx prisma db push

# Frontend показывает ошибку подключения
# Проверьте, что backend запущен
curl http://localhost:3001/health

# PostgreSQL не запускается
docker compose logs postgres
# Проверьте, что порт 5432 не занят
sudo netstat -tulpn | grep 5432

# Ошибка миграций
docker compose exec backend npx prisma migrate reset
docker compose exec backend npx prisma migrate deploy

# Контейнер постоянно перезапускается
docker compose logs --tail=100 <service_name>

# Нет места на диске
df -h
docker system prune -a --volumes
```

## Полезные SQL запросы

```bash
# Список всех пользователей
docker compose exec postgres psql -U postgres -d ai_chat_app -c "SELECT id, email, name, created_at FROM users;"

# Список чатов пользователя
docker compose exec postgres psql -U postgres -d ai_chat_app -c "SELECT * FROM chats WHERE user_id = 'USER_ID';"

# Удалить пользователя и все его данные
docker compose exec postgres psql -U postgres -d ai_chat_app -c "DELETE FROM users WHERE email = 'user@example.com';"

# Статистика по моделям
docker compose exec postgres psql -U postgres -d ai_chat_app -c "SELECT model, COUNT(*) FROM chats GROUP BY model;"
```
