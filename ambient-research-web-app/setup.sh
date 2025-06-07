#!/bin/bash


set -e  # Exit on any error

echo "🚀 Setting up ambient-research Next.js web app..."

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the ambient-research-web-app directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    echo "DATABASE_URL=\"file:./dev.db\"" > .env.local
    echo "✅ Created .env.local with DATABASE_URL"
else
    echo "⚠️  .env.local already exists, skipping environment setup"
fi

echo "🗄️  Setting up database with Prisma..."
export $(cat .env.local | xargs)
npx prisma generate
npx prisma migrate dev --name init

echo "🎉 Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The app will be available at: http://localhost:3000"
echo ""
echo "Additional commands:"
echo "  npm run lint    - Run ESLint"
echo "  npm run build   - Build for production"
echo "  npm run start   - Start production server"
