@echo off
echo ========================================
echo   Fix Trademark Image URLs
echo ========================================
echo.
echo This will update all trademarks in Firebase
echo to have correct image URLs.
echo.

node scripts/fix-image-urls.js

echo.
pause
