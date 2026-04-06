-- Инициализация базы данных для AI Chat App

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы чатов
CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    model TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chats_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Создание таблицы сообщений
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_chatId_fkey FOREIGN KEY ("chatId") REFERENCES chats(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Создание таблицы файлов
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    size INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT files_messageId_fkey FOREIGN KEY ("messageId") REFERENCES messages(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS chats_userId_idx ON chats("userId");
CREATE INDEX IF NOT EXISTS messages_chatId_idx ON messages("chatId");
CREATE INDEX IF NOT EXISTS files_messageId_idx ON files("messageId");

-- Вывод информации о созданных таблицах
SELECT 'База данных успешно инициализирована!' as status;
