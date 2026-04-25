@echo off
REM ============================================================
REM GEC Event Portal - Start Backend Server
REM ============================================================

setlocal enabledelayedexpansion
color 0F

echo.
echo ============================================================
echo    GEC Event Portal - Backend Server
echo ============================================================
echo.

REM Check if we're in the right directory
if not exist "backend\" (
    echo ❌ ERROR: backend folder not found!
    echo.
    echo Please run this script from: C:\Users\Ameen Khan\Documents\gec-portal\
    echo.
    pause
    exit /b 1
)

REM Check if backend dependencies are installed
if not exist "backend\node_modules\" (
    echo ❌ ERROR: Backend dependencies not installed!
    echo.
    echo Please run: setup-all.bat
    echo.
    pause
    exit /b 1
)

REM Check for .env file
if not exist "backend\.env" (
    echo ⚠️  WARNING: backend\.env file not found
    echo.
    echo You may need to create this file with database configuration
    echo See SETUP_LOCAL.md for details
    echo.
)

echo Starting backend server...
echo.
echo 🚀 The backend will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================================
echo.

cd backend

REM Start the backend server
call npm run dev

REM If npm run dev fails, try node directly
if errorlevel 1 (
    echo.
    echo ⚠️  npm run dev failed
    echo Trying alternative startup method...
    echo.
    
    if exist "src\index.js" (
        node src\index.js
    ) else if exist "server.js" (
        node server.js
    ) else if exist "index.js" (
        node index.js
    ) else (
        echo ❌ ERROR: Could not find entry point!
        echo.
        echo Backend server entry point not found
        echo Expected one of: src/index.js, server.js, or index.js
        echo.
        pause
        exit /b 1
    )
)

cd ..
