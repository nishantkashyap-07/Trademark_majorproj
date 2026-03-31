@echo off
echo ========================================
echo   Database Re-seeding Script
echo ========================================
echo.
echo This will clear and re-populate your Firebase database
echo with fresh demo data.
echo.
pause

echo.
echo Running re-seed script...
node scripts/reseed-database.js

echo.
echo ========================================
echo   Re-seeding Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Refresh your browser
echo 2. Check the home page for updated data
echo.
pause
