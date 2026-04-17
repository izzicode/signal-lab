#!/bin/sh
set -e

echo "Waiting for database to be ready..."

max_attempts=30
attempt=0

until [ $attempt -ge $max_attempts ]; do
  attempt=$((attempt + 1))
  if npx prisma db push --schema=./prisma/schema.prisma --skip-generate 2>&1; then
    echo "Schema applied."
    break
  fi
  echo "Not ready yet ($attempt/$max_attempts), retrying in 3s..."
  sleep 3
done

if [ $attempt -ge $max_attempts ]; then
  echo "Failed to connect to database after $max_attempts attempts"
  exit 1
fi

echo "Running seed..."
node seed.js || echo "Seed skipped (non-fatal)"

echo "Starting Signal Lab backend..."
exec "$@"
