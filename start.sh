
echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting the application..."
node dist/main.js