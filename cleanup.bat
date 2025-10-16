@echo off
echo ========================================
echo   تنظيف المشروع - حذف الملفات الزائدة
echo ========================================
echo.

REM Documentation Files
echo [1/7] حذف ملفات Documentation القديمة...
del /Q COMPLETE_UNIFICATION_SUMMARY.md 2>nul
del /Q DEPLOYMENT_COMPLETE.md 2>nul
del /Q ENCRYPTION_KEY_FIX.md 2>nul
del /Q FIX_APPLIED.md 2>nul
del /Q FIX_SUMMARY_AR.md 2>nul
del /Q FOLLOW_CAMPAIGNS_BACKEND_COMPLETE.md 2>nul
del /Q FOLLOW_CAMPAIGNS_FEATURE.md 2>nul
del /Q FOLLOW_CAMPAIGNS_FIXES.md 2>nul
del /Q INSTALLATION_STATUS.md 2>nul
del /Q MANUAL_STEPS.md 2>nul
del /Q MODIFICATION_GUIDE.md 2>nul
del /Q NEXT_STEPS.md 2>nul
del /Q PROBLEM_SOLVED.md 2>nul
del /Q PROJECT_STATUS.md 2>nul
del /Q PROJECT_UNDERSTANDING.md 2>nul
del /Q RAILWAY_DEPLOYMENT_GUIDE.md 2>nul
del /Q RAILWAY_DEPLOYMENT_PROGRESS.md 2>nul
del /Q READY_FOR_MODIFICATIONS.md 2>nul
del /Q STEP_TARGETS_UNIFICATION.md 2>nul
del /Q UI_UX_UNIFICATION.md 2>nul
del /Q UNIFICATION_SUMMARY_AR.md 2>nul
del /Q WHAT_I_DID_AND_WHAT_YOU_NEED.md 2>nul

REM Batch Files
echo [2/7] حذف Batch files المؤقتة...
del /Q add-extract-followers.bat 2>nul
del /Q add-followers-table.bat 2>nul
del /Q commit-fix.bat 2>nul
del /Q commit.bat 2>nul
del /Q debug-encryption-v2.bat 2>nul
del /Q debug-encryption.bat 2>nul
del /Q debug-redis.bat 2>nul
del /Q disable-redis.bat 2>nul
del /Q enable-campaigns.bat 2>nul
del /Q final-push.bat 2>nul
del /Q fix-api-url.bat 2>nul
del /Q fix-campaign-pacing.bat 2>nul
del /Q fix-cors-final.bat 2>nul
del /Q fix-cors.bat 2>nul
del /Q fix-dirname.bat 2>nul
del /Q fix-extract-followers-final.bat 2>nul
del /Q fix-followers-response.bat 2>nul
del /Q fix-polling.bat 2>nul
del /Q fix-redis-completely.bat 2>nul
del /Q fix-redis-connection.bat 2>nul
del /Q fix-redis-final.bat 2>nul
del /Q fix-restart-loop.bat 2>nul
del /Q fix-spa-routing.bat 2>nul
del /Q fix-trust-proxy.bat 2>nul
del /Q fix-wildcard.bat 2>nul
del /Q trigger-rebuild.bat 2>nul

REM Migration Files
echo [3/7] حذف Migration files القديمة...
del /Q migrate-add-follow-campaigns.js 2>nul
del /Q migrate-add-retry-fields.js 2>nul
del /Q migrate-to-postgres.js 2>nul
del /Q reset-database.js 2>nul
del /Q test-encryption-fix.js 2>nul

REM Disabled Files
echo [4/7] حذف Disabled runner files...
del /Q server\campaign-runner-disabled.ts 2>nul
del /Q server\follow-runner-disabled.ts 2>nul

REM Old Database
echo [5/7] حذف SQLite database القديم...
del /Q reachly.db 2>nul

REM Docs Folder
echo [6/7] حذف Docs files القديمة...
del /Q docs\DELAY_SYSTEM_EXPLAINED.md 2>nul
del /Q docs\IMPROVEMENTS_PLAN.md 2>nul
del /Q docs\ROADMAP.md 2>nul
del /Q docs\TEST_PACING_RETRY.md 2>nul
del /Q docs\UPDATES_APPLIED.md 2>nul

REM Utility Files
echo [7/7] حذف Utility files غير المستخدمة...
del /Q generate-keys.cjs 2>nul

echo.
echo ========================================
echo   ✅ تم التنظيف بنجاح!
echo ========================================
echo.
echo الملفات المتبقية:
echo   - README.md
echo   - README_AR.md
echo   - START_HERE.md
echo   - REDIS_SETUP.md
echo   - CLEANUP_PLAN.md
echo   - push.bat
echo.
echo المجلد docs المتبقي:
echo   - API_DOCS.md
echo   - PACING_AND_RETRY_SYSTEM.md
echo   - TROUBLESHOOTING.md
echo.
pause
