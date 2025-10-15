@echo off
git add .
git commit -m "Fix: Enable trust proxy for Railway deployment"
git push origin main
echo.
echo ✅ Trust proxy enabled!
pause
