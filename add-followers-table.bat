@echo off
git add .
git commit -m "Add followers table to database schema"
git push origin main
echo.
echo ✅ Followers table added!
pause
