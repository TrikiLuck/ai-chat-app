#!/bin/bash

# Скрипт для восстановления базы данных из резервной копии

set -e

BACKUP_DIR="./backups"

echo "♻️  Восстановление базы данных из резервной копии"
echo "=================================================="
echo ""

# Проверяем наличие бэкапов
if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR/backup_*.sql.gz 2>/dev/null)" ]; then
    echo "❌ Резервные копии не найдены в директории $BACKUP_DIR"
    exit 1
fi

# Показываем список доступных бэкапов
echo "📁 Доступные резервные копии:"
echo ""
ls -lh $BACKUP_DIR/backup_*.sql.gz | nl
echo ""

# Запрашиваем номер бэкапа
read -p "Введите номер бэкапа для восстановления: " BACKUP_NUM

# Получаем путь к выбранному бэкапу
BACKUP_FILE=$(ls $BACKUP_DIR/backup_*.sql.gz | sed -n "${BACKUP_NUM}p")

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Неверный номер бэкапа"
    exit 1
fi

echo ""
echo "⚠️  ВНИМАНИЕ: Это действие удалит все текущие данные!"
echo "Выбранный бэкап: $BACKUP_FILE"
echo ""
read -p "Продолжить? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Отменено"
    exit 0
fi

# Проверяем, что контейнер запущен
if ! docker compose ps postgres | grep -q "Up"; then
    echo "❌ Контейнер PostgreSQL не запущен"
    exit 1
fi

echo ""
echo "🗄️  Восстановление базы данных..."

# Распаковываем и восстанавливаем
gunzip -c $BACKUP_FILE | docker compose exec -T postgres psql -U postgres ai_chat_app

echo ""
echo "✅ База данных успешно восстановлена!"
echo ""
echo "🔄 Перезапуск backend..."
docker compose restart backend

echo ""
echo "✨ Готово!"
