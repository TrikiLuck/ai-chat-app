# Полный гайд по деплою AI Chat App на хоумлабу

Этот гайд поможет развернуть AI Chat App на вашем домашнем сервере с использованием Docker.

## Требования

- Сервер с Linux (Ubuntu 20.04+, Debian 11+, или другой дистрибутив)
- Docker и Docker Compose установлены
- Минимум 2GB RAM
- Доступ по SSH к серверу
- (Опционально) Доменное имя для SSL

## Шаг 1: Установка Docker и Docker Compose

Если Docker еще не установлен:

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите зависимости
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Добавьте официальный GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавьте репозиторий Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установите Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиньтесь или выполните
newgrp docker

# Проверьте установку
docker --version
docker compose version
```

## Шаг 2: Клонирование проекта на сервер

```bash
# Подключитесь к серверу по SSH
ssh user@your-server-ip

# Создайте директорию для проекта
mkdir -p ~/apps
cd ~/apps

# Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/ai-chat-app.git
cd ai-chat-app
```

## Шаг 3: Настройка переменных окружения

### 3.1 Создайте основной .env файл

```bash
nano .env
```

Добавьте следующее содержимое:

```env
# JWT Secret - сгенерируйте случайную строку
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Omniroute API настройки
OMNIROUTE_API_KEY=your-omniroute-api-key-here
OMNIROUTE_ENDPOINT=https://api.omniroute.ai

# PostgreSQL настройки (можно оставить как есть)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=strong-postgres-password-here
POSTGRES_DB=ai_chat_app
```

**Важно:** Замените значения на свои:
- `JWT_SECRET` - сгенерируйте случайную строку (можно использовать: `openssl rand -base64 32`)
- `OMNIROUTE_API_KEY` - ваш API ключ от Omniroute
- `POSTGRES_PASSWORD` - надежный пароль для PostgreSQL

### 3.2 Обновите docker-compose.yml

Откройте `docker-compose.yml` и убедитесь, что он использует переменные из .env:

```bash
nano docker-compose.yml
```

Файл должен выглядеть так:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ai-chat-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-ai_chat_app}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ai-chat-backend
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-ai_chat_app}
      JWT_SECRET: ${JWT_SECRET}
      OMNIROUTE_API_KEY: ${OMNIROUTE_API_KEY}
      OMNIROUTE_ENDPOINT: ${OMNIROUTE_ENDPOINT}
      PORT: 3001
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/uploads:/app/uploads
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: /api
    container_name: ai-chat-frontend
    ports:
      - "8080:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

## Шаг 4: Сборка и запуск приложения

```bash
# Соберите и запустите контейнеры
docker compose up -d --build

# Проверьте статус контейнеров
docker compose ps

# Посмотрите логи
docker compose logs -f
```

Сборка может занять 5-10 минут при первом запуске.

## Шаг 5: Выполнение миграций базы данных

После того как контейнеры запустились:

```bash
# Выполните миграции Prisma
docker compose exec backend npx prisma migrate deploy

# Или если нужно создать миграцию с нуля
docker compose exec backend npx prisma migrate dev --name init
```

## Шаг 6: Проверка работы

```bash
# Проверьте, что все контейнеры запущены
docker compose ps

# Должны быть запущены 3 контейнера:
# - ai-chat-postgres
# - ai-chat-backend
# - ai-chat-frontend

# Проверьте логи backend
docker compose logs backend

# Проверьте логи frontend
docker compose logs frontend
```

Откройте браузер и перейдите на:
- `http://your-server-ip:8080` - Frontend приложение
- `http://your-server-ip:3001/health` - Backend health check

## Шаг 7: Настройка Nginx Reverse Proxy (рекомендуется)

Для использования на порту 80/443 и с доменным именем:

### 7.1 Установите Nginx

```bash
sudo apt install -y nginx
```

### 7.2 Создайте конфигурацию

```bash
sudo nano /etc/nginx/sites-available/ai-chat-app
```

Добавьте:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен или IP

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Для SSE streaming
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

### 7.3 Активируйте конфигурацию

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/ai-chat-app /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

Теперь приложение доступно на `http://your-domain.com` или `http://your-server-ip`

## Шаг 8: Настройка SSL с Let's Encrypt (опционально)

Если у вас есть доменное имя:

```bash
# Установите Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d your-domain.com

# Certbot автоматически настроит HTTPS
```

## Управление приложением

### Просмотр логов

```bash
# Все логи
docker compose logs -f

# Только backend
docker compose logs -f backend

# Только frontend
docker compose logs -f frontend

# Только PostgreSQL
docker compose logs -f postgres
```

### Перезапуск сервисов

```bash
# Перезапустить все
docker compose restart

# Перезапустить только backend
docker compose restart backend

# Перезапустить только frontend
docker compose restart frontend
```

### Остановка и запуск

```bash
# Остановить все контейнеры
docker compose stop

# Запустить все контейнеры
docker compose start

# Остановить и удалить контейнеры (данные сохранятся)
docker compose down

# Запустить заново
docker compose up -d
```

### Обновление приложения

```bash
# Перейдите в директорию проекта
cd ~/apps/ai-chat-app

# Получите последние изменения
git pull

# Пересоберите и перезапустите
docker compose down
docker compose up -d --build

# Выполните миграции если нужно
docker compose exec backend npx prisma migrate deploy
```

### Резервное копирование базы данных

```bash
# Создайте backup
docker compose exec postgres pg_dump -U postgres ai_chat_app > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановите из backup
docker compose exec -T postgres psql -U postgres ai_chat_app < backup_20260406_120000.sql
```

## Мониторинг ресурсов

```bash
# Использование ресурсов контейнерами
docker stats

# Размер контейнеров и образов
docker system df

# Очистка неиспользуемых ресурсов
docker system prune -a
```

## Troubleshooting

### Проблема: Контейнер backend не запускается

```bash
# Проверьте логи
docker compose logs backend

# Проверьте, что PostgreSQL запущен
docker compose ps postgres

# Проверьте подключение к БД
docker compose exec backend npx prisma db push
```

### Проблема: Frontend не может подключиться к backend

```bash
# Проверьте, что backend отвечает
curl http://localhost:3001/health

# Проверьте логи frontend
docker compose logs frontend

# Проверьте конфигурацию Nginx
sudo nginx -t
```

### Проблема: Ошибка при миграциях

```bash
# Сбросьте базу данных (ВНИМАНИЕ: удалит все данные)
docker compose exec backend npx prisma migrate reset

# Или создайте миграцию заново
docker compose exec backend npx prisma migrate dev --name init
```

### Проблема: Порты заняты

```bash
# Проверьте, какие порты используются
sudo netstat -tulpn | grep -E ':(80|443|3001|5432|8080)'

# Измените порты в docker-compose.yml если нужно
```

## Безопасность

### Рекомендации:

1. **Firewall:** Настройте UFW для ограничения доступа
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

2. **Регулярные обновления:**
```bash
# Обновляйте систему
sudo apt update && sudo apt upgrade -y

# Обновляйте Docker образы
docker compose pull
docker compose up -d
```

3. **Сильные пароли:** Используйте надежные пароли в .env

4. **Backup:** Регулярно делайте резервные копии базы данных

5. **Мониторинг:** Настройте мониторинг логов и ресурсов

## Автозапуск при перезагрузке

Docker Compose с `restart: unless-stopped` автоматически запустит контейнеры после перезагрузки сервера.

Проверьте:
```bash
# Перезагрузите сервер
sudo reboot

# После перезагрузки проверьте статус
docker compose ps
```

## Полезные команды

```bash
# Войти в контейнер backend
docker compose exec backend sh

# Войти в PostgreSQL
docker compose exec postgres psql -U postgres -d ai_chat_app

# Посмотреть переменные окружения backend
docker compose exec backend env

# Очистить логи
docker compose logs --tail=0 -f

# Экспорт/импорт данных
docker compose exec postgres pg_dump -U postgres ai_chat_app | gzip > backup.sql.gz
gunzip < backup.sql.gz | docker compose exec -T postgres psql -U postgres ai_chat_app
```

## Готово!

Ваше приложение AI Chat App теперь запущено на хоумлабе и доступно по адресу:
- `http://your-server-ip:8080` (без Nginx)
- `http://your-domain.com` (с Nginx)
- `https://your-domain.com` (с SSL)

Для первого использования:
1. Откройте приложение в браузере
2. Нажмите "Зарегистрироваться"
3. Создайте аккаунт
4. Создайте новый чат
5. Начните общаться с AI!

Если возникнут проблемы, проверьте логи: `docker compose logs -f`
