#!/bin/bash

echo "🚀 Senior Safeguard - Deployment Script"
echo "========================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Check for required environment variables
echo "📋 Checking environment variables..."
if [ -f .env.local ]; then
    echo "✅ Found .env.local"
else
    echo "⚠️  .env.local not found - you'll need to set environment variables in Vercel dashboard"
fi

echo ""
echo "🎯 Ready to deploy!"
echo ""
echo "Choose deployment option:"
echo "1. Deploy to production (recommended)"
echo "2. Preview deployment (testing)"
echo "3. Cancel"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to PRODUCTION..."
        echo ""
        echo "⚠️  IMPORTANT: Make sure you've set these environment variables in Vercel:"
        echo "   - NEXT_PUBLIC_TTS_SERVER_URL (your Railway TTS server URL)"
        echo "   - Other optional variables (OpenAI, Supabase, etc.)"
        echo ""
        read -p "Press Enter to continue or Ctrl+C to cancel..."
        
        vercel --prod
        
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "📝 Next steps:"
        echo "   1. Test your production URL"
        echo "   2. Verify TTS is working"
        echo "   3. Test all languages"
        echo "   4. Share with users!"
        ;;
    2)
        echo ""
        echo "🔍 Creating preview deployment..."
        vercel
        echo ""
        echo "✅ Preview deployment complete!"
        echo "Test it before promoting to production."
        ;;
    3)
        echo "Deployment cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice. Deployment cancelled."
        exit 1
        ;;
esac

echo ""
echo "🎉 Done!"

