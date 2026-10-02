@echo off
echo ============================================
echo   In Their Shoes - Kolkata City Survival
echo ============================================
echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Make sure Node.js is installed.
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)
echo.
echo Building server...
cd server
call npm run build
if errorlevel 1 (
    echo ERROR: Server build failed.
    pause
    exit /b 1
)
cd ..
echo.
echo ============================================
echo   Starting the game...
echo   Server: http://localhost:3001
echo   Game:   http://localhost:5173
echo ============================================
echo.
echo Opening game in your browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo.
call npx concurrently "npm run start --workspace=server" "npm run dev --workspace=client"
pause
