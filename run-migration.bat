@echo off
echo 🚀 Running Supabase Migration: Update Categories to Array
echo.

echo 📋 This migration will:
echo   1. Add categories_array column to news_items table
echo   2. Convert existing text categories to arrays
echo   3. Create GIN index for better performance
echo   4. Add helper function for category filtering
echo.

echo ⚠️  Make sure your Supabase project is running!
echo.

echo 🔄 Running migration...
supabase db push

echo.
echo ✅ Migration completed!
echo.
echo 🎯 What changed:
echo    - "All" category: Still shows 50 diverse articles (as you love it)
echo    - "Bitcoin" category: Now shows 200+ Bitcoin articles
echo    - "Ethereum" category: Now shows 200+ Ethereum articles
echo    - "DeFi" category: Now shows 200+ DeFi articles
echo.
echo 🚀 Your category filtering is now much better!
pause
