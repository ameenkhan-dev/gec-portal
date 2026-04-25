@echo off
REM ============================================================
REM GEC Event Portal - Start Frontend Server
REM ============================================================

setlocal enabledelayedexpansion
color 0F

echo.
echo ============================================================
echo    GEC Event Portal - Frontend Server
echo ============================================================
echo.

REM Check if we're in the right directory
if not exist "frontend\" (
    echo ❌ ERROR: frontend folder not found!
    echo.
    echo Please run this script from: C:\Users\Ameen Khan\Documents\gec-portal\
    echo.
    pause
    exit /b 1
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules\" (
    echo ❌ ERROR: Frontend dependencies not installed!
    echo.
    echo Please run: setup-all.bat
    echo.
    pause
    exit /b 1
)

REM Check for .env file
if not exist "frontend\.env" (
    echo ⚠️  WARNING: frontend\.env file not found
    echo.
    echo You may need to create this file with API configuration
    echo See SETUP_LOCAL.md for details
    echo.
)

echo Starting frontend server...
echo.
echo 🌐 The frontend will be available at: http://localhost:3000
echo.
echo The page will automatically open in your default browser.
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================================
echo.

cd frontend

REM Start the frontend server
call npm start

cd ..
