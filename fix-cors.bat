@echo off
git add .
git commit -m "Fix: Allow same-origin requests in CORS for production"
git push origin main
echo.
echo ✅ CORS fixed!
pause
