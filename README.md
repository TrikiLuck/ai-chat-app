# AI Chat App

AI Chat Application - аналог Claude с интеграцией Omniroute для работы с различными LLM моделями.

## Технологический стек

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL + Prisma ORM
- JWT аутентификация
- Omniroute API интеграция

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router
- Markdown рендеринг с подсветкой кода

## Возможности

- 💬 Интерфейс чата в стиле Claude
- 🔄 Streaming ответов в реальном времени
- 📝 Markdown рендеринг с подсветкой синтаксиса
- 💾 История чатов
- 🤖 Выбор различных LLM моделей через Omniroute
- 📎 Загрузка файлов (только текстовые, изображения не поддерживаются)
- 🔐 Аутентификация пользователей

## Структура проекта

```
ai-chat-app/
├── backend/          # Express API сервер
├── frontend/         # React приложение
├── shared/           # Общие типы TypeScript
└── docker-compose.yml
```

## Установка и запуск

### Требования
- Node.js 20+
- PostgreSQL 16+
- npm или yarn

### Настройка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd ai-chat-app
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_chat_app
JWT_SECRET=your-secret-key
OMNIROUTE_API_KEY=your-omniroute-key
OMNIROUTE_ENDPOINT=https://api.omniroute.ai
PORT=3001
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

4. Запустите миграции базы данных:
```bash
cd backend
npx prisma migrate dev
```

5. Запустите приложение:
```bash
npm run dev
```

Backend будет доступен на `http://localhost:3001`
Frontend будет доступен на `http://localhost:5173`

## Docker

Для запуска через Docker:

```bash
docker-compose up -d
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Chats
- `GET /api/chats` - Список чатов
- `POST /api/chats` - Создать чат
- `GET /api/chats/:id` - Получить чат
- `PATCH /api/chats/:id` - Обновить чат
- `DELETE /api/chats/:id` - Удалить чат

### Messages
- `POST /api/chats/:id/messages` - Отправить сообщение (SSE streaming)
- `GET /api/chats/:id/messages` - Получить сообщения

### Files
- `POST /api/files/upload` - Загрузить файл
- `GET /api/files/:id` - Скачать файл

### Models
- `GET /api/models` - Список доступных моделей

## Разработка

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

## Лицензия

MIT
