#!/bin/bash

# Скрипт для инициализации базы данных

set -e

echo "🗄️  Инициализация базы данных AI Chat App (MySQL)"
echo "=================================================="
echo ""

# Проверка, что контейнеры запущены
if ! docker compose ps mysql | grep -q "Up"; then
    echo "❌ Контейнер MySQL не запущен"
    echo "Запустите: docker compose up -d"
    exit 1
fi

echo "✅ MySQL контейнер запущен"
echo ""

# Проверка существования таблиц
echo "🔍 Проверка существующих таблиц..."
TABLES=$(docker compose exec -T mysql mysql -u root -prootpassword ai_chat_app -e "SHOW TABLES;" 2>/dev/null | wc -l || echo "0")

if [ "$TABLES" -gt "1" ]; then
    echo "⚠️  База данных уже содержит таблицы"
    read -p "Пересоздать базу данных? Это удалит все данные! (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo "Отменено"
        exit 0
    fi
    
    echo "🗑️  Удаление существующих таблиц..."
    docker compose exec -T mysql mysql -u root -prootpassword ai_chat_app -e "DROP DATABASE ai_chat_app; CREATE DATABASE ai_chat_app;"
fi

echo ""
echo "📝 Применение миграций через Prisma..."

# Применение миграций через Prisma
if docker compose exec -T backend npx prisma migrate deploy 2>/dev/null; then
    echo "✅ Миграции Prisma применены успешно"
else
    echo "❌ Ошибка при применении миграций"
    exit 1
fi

echo ""
echo "🔍 Проверка созданных таблиц..."
docker compose exec -T mysql mysql -u root -prootpassword ai_chat_app -e "SHOW TABLES;"

echo ""
echo "✅ База данных успешно инициализирована!"
echo ""
echo "📊 Статистика:"
docker compose exec -T mysql mysql -u root -prootpassword ai_chat_app -e "
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'chats', COUNT(*) FROM chats
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'files', COUNT(*) FROM files;
"

echo ""
echo "🎉 Готово! Теперь можно регистрироваться на http://localhost:1499"
