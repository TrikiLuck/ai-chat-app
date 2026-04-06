# 🚀 Быстрый старт - AI Chat App на хоумлабе

## За 5 минут до запуска

### 1. Подготовка сервера

```bash
# Подключитесь к серверу
ssh user@your-server-ip

# Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/ai-chat-app.git
cd ai-chat-app
```

### 2. Настройка переменных окружения

```bash
# Скопируйте пример конфигурации
cp .env.example .env

# Отредактируйте .env
nano .env
```

Минимальные настройки:
```env
JWT_SECRET=your-random-secret-here
OMNIROUTE_API_KEY=your-omniroute-api-key
OMNIROUTE_ENDPOINT=https://api.omniroute.ai
POSTGRES_PASSWORD=strong-password-here
```

**Сгенерировать JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Запуск

```bash
# Запустите автоматический деплой
./deploy.sh
```

Или вручную:
```bash
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
```

### 4. Готово!

Откройте в браузере:
- **http://your-server-ip:8080**

## Первое использование

1. Нажмите "Зарегистрироваться"
2. Создайте аккаунт
3. Нажмите "+ Новый чат"
4. Выберите модель
5. Начните общаться!

## Основные команды

```bash
# Просмотр логов
docker compose logs -f

# Перезапуск
docker compose restart

# Остановка
docker compose down

# Бэкап
./backup.sh

# Обновление
./update.sh
```

## Настройка доменного имени (опционально)

### С Nginx

```bash
# Установите Nginx
sudo apt install -y nginx

# Создайте конфигурацию
sudo nano /etc/nginx/sites-available/ai-chat-app
```

Добавьте:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

```bash
# Активируйте
sudo ln -s /etc/nginx/sites-available/ai-chat-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL с Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

**Проблема:** Контейнеры не запускаются
```bash
docker compose logs
```

**Проблема:** Backend не подключается к БД
```bash
docker compose restart postgres
docker compose logs backend
```

**Проблема:** Frontend показывает ошибку
```bash
curl http://localhost:3001/health
docker compose logs frontend
```

## Полная документация

- **HOMELAB_DEPLOY.md** - Подробный гайд по деплою
- **COMMANDS.md** - Все команды для управления
- **SETUP.md** - Инструкции по настройке
- **README.md** - Общая информация о проекте

## Поддержка

Если возникли проблемы:
1. Проверьте логи: `docker compose logs -f`
2. Проверьте статус: `docker compose ps`
3. Создайте issue на GitHub

---

**Приятного использования! 🎉**
