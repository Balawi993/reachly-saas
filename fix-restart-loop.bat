@echo off
git add .
git commit -m "Fix: Prevent server restart loop - proper async initialization"
git push origin main
echo.
echo ✅ Fix pushed!
pause
