#!/bin/bash

# Скрипт для резервного копирования базы данных

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "💾 Создание резервной копии базы данных..."
echo ""

# Создаем директорию для бэкапов
mkdir -p $BACKUP_DIR

# Проверяем, что контейнер запущен
if ! docker compose ps postgres | grep -q "Up"; then
    echo "❌ Контейнер PostgreSQL не запущен"
    exit 1
fi

# Создаем бэкап
echo "📦 Экспорт базы данных..."
docker compose exec -T postgres pg_dump -U postgres ai_chat_app > $BACKUP_FILE

# Сжимаем бэкап
echo "🗜️  Сжатие бэкапа..."
gzip $BACKUP_FILE

echo ""
echo "✅ Резервная копия создана: ${BACKUP_FILE}.gz"
echo "📊 Размер: $(du -h ${BACKUP_FILE}.gz | cut -f1)"
echo ""

# Удаляем старые бэкапы (старше 30 дней)
echo "🧹 Очистка старых бэкапов (старше 30 дней)..."
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo ""
echo "📁 Список бэкапов:"
ls -lh $BACKUP_DIR/backup_*.sql.gz 2>/dev/null || echo "Нет бэкапов"
