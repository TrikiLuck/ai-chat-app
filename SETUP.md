# Инструкция по подключению к GitHub

Проект успешно создан и закоммичен локально. Теперь нужно создать репозиторий на GitHub и подключить его.

## Шаги для подключения к GitHub:

### 1. Создайте репозиторий на GitHub
Перейдите на https://github.com/new и создайте новый репозиторий с именем `ai-chat-app` (публичный или приватный на ваш выбор).

**Важно:** НЕ инициализируйте репозиторий с README, .gitignore или лицензией - у нас уже есть эти файлы.

### 2. Подключите локальный репозиторий к GitHub
После создания репозитория на GitHub, выполните следующие команды:

```bash
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/ai-chat-app.git

# Или используйте SSH (если настроен)
git remote add origin git@github.com:YOUR_USERNAME/ai-chat-app.git

# Отправьте код на GitHub
git branch -M main
git push -u origin main
```

## Следующие шаги для запуска проекта:

### Локальная разработка

1. **Установите зависимости:**
```bash
npm install
```

2. **Настройте PostgreSQL:**
Убедитесь, что PostgreSQL запущен локально или используйте Docker:
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_chat_app \
  -p 5432:5432 \
  postgres:16-alpine
```

3. **Настройте переменные окружения:**

Backend (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_chat_app
JWT_SECRET=your-secret-key-change-this
OMNIROUTE_API_KEY=your-omniroute-api-key
OMNIROUTE_ENDPOINT=https://api.omniroute.ai
PORT=3001
NODE_ENV=development
```

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

4. **Запустите миграции базы данных:**
```bash
cd backend
npx prisma migrate dev --name init
cd ..
```

5. **Запустите приложение:**
```bash
# Из корневой директории
npm run dev
```

Backend будет доступен на http://localhost:3001
Frontend будет доступен на http://localhost:5173

### Деплой на хоумлабу через Docker

1. **Создайте `.env` файл в корне проекта:**
```env
JWT_SECRET=your-production-secret-key
OMNIROUTE_API_KEY=your-omniroute-api-key
OMNIROUTE_ENDPOINT=https://api.omniroute.ai
```

2. **Запустите через Docker Compose:**
```bash
docker-compose up -d
```

3. **Выполните миграции:**
```bash
docker-compose exec backend npx prisma migrate deploy
```

Приложение будет доступно на http://your-server-ip

### Настройка Nginx (опционально для хоумлаба)

Если хотите использовать свой домен и SSL:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Структура проекта

```
ai-chat-app/
├── backend/              # Express API сервер
│   ├── src/
│   │   ├── config/       # Конфигурация
│   │   ├── controllers/  # API контроллеры
│   │   ├── middleware/   # Middleware (auth, errors)
│   │   ├── routes/       # API роуты
│   │   └── services/     # Бизнес-логика (Omniroute)
│   └── prisma/           # Схема БД
├── frontend/             # React приложение
│   └── src/
│       ├── components/   # UI компоненты
│       ├── pages/        # Страницы
│       ├── services/     # API клиенты
│       └── store/        # State management (Zustand)
└── docker-compose.yml    # Docker конфигурация
```

## Возможности приложения

✅ Регистрация и аутентификация пользователей (JWT)
✅ Создание и управление чатами
✅ Streaming ответов от LLM в реальном времени
✅ Markdown рендеринг с подсветкой кода
✅ Выбор различных моделей через Omniroute
✅ Загрузка файлов к сообщениям
✅ История всех чатов
✅ Responsive дизайн

## Troubleshooting

**Проблема:** Backend не может подключиться к PostgreSQL
**Решение:** Проверьте, что PostgreSQL запущен и DATABASE_URL правильный

**Проблема:** Frontend не может подключиться к backend
**Решение:** Проверьте VITE_API_URL в frontend/.env и убедитесь, что backend запущен

**Проблема:** Ошибка при streaming от Omniroute
**Решение:** Проверьте OMNIROUTE_API_KEY и OMNIROUTE_ENDPOINT, убедитесь, что API key валидный

## Контакты и поддержка

Если возникнут вопросы, создайте issue в GitHub репозитории.

Удачи с деплоем! 🚀
