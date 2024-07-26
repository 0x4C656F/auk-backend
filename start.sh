#!/bin/sh

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the NestJS application
echo "Starting the application..."
node dist/main.js