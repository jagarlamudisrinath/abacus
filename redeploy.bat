@echo off
echo ========================================
echo   ALAMA Abacus - Redeploy
echo ========================================
echo.
echo Pulling latest code from git...
git pull
echo.
echo Stopping and removing containers...
docker compose down
echo.
echo Rebuilding images (no cache)...
docker compose build --no-cache
echo.
echo Starting services...
docker compose up -d
echo.
echo ========================================
echo   Redeployment complete!
echo ========================================
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:4001
echo.
pause
