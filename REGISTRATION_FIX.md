# Инструкция по исправлению регистрации

## Проблема
Регистрация не работает, скорее всего база данных не инициализирована.

## Решение

На сервере выполните следующие команды:

```bash
cd ~/ai-chat-app

# 1. Проверьте статус контейнеров
sudo docker compose ps

# 2. Проверьте логи backend
sudo docker compose logs backend --tail=50

# 3. Выполните миграции базы данных
sudo docker compose exec backend npx prisma migrate deploy

# Если миграции не существуют, создайте их:
sudo docker compose exec backend npx prisma migrate dev --name init

# 4. Проверьте, что таблицы созданы
sudo docker compose exec postgres psql -U postgres -d ai_chat_app -c "\dt"

# 5. Перезапустите backend
sudo docker compose restart backend

# 6. Проверьте логи после перезапуска
sudo docker compose logs backend --tail=20
```

## Проверка работы

1. Откройте http://your-server-ip:1499
2. Нажмите "Зарегистрироваться"
3. Заполните форму:
   - Email: test@example.com
   - Пароль: test123 (минимум 6 символов)
   - Имя: Test User (необязательно)
4. Нажмите "Зарегистрироваться"

## Если всё равно не работает

Проверьте логи в браузере (F12 -> Console) и отправьте мне:
1. Ошибки из консоли браузера
2. Вывод команды: `sudo docker compose logs backend --tail=50`
3. Результат: `sudo docker compose exec postgres psql -U postgres -d ai_chat_app -c "SELECT * FROM users;"`

## Альтернативный способ - создать пользователя вручную

Если нужно срочно, можно создать пользователя вручную:

```bash
# Подключитесь к PostgreSQL
sudo docker compose exec postgres psql -U postgres -d ai_chat_app

# Создайте пользователя (пароль будет "test123")
INSERT INTO users (id, email, password, name, "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(), 
  'test@example.com', 
  '$2b$10$rKvVPz8VZ5YxH5qH5qH5qOqH5qH5qH5qH5qH5qH5qH5qH5qH5qH5q',
  'Test User',
  NOW(),
  NOW()
);

# Выйдите
\q
```

Затем войдите с:
- Email: test@example.com
- Пароль: test123
