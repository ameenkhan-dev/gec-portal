@echo off
REM ============================================================
REM GEC Event Portal - Complete Setup Script
REM This script installs all dependencies for frontend and backend
REM ============================================================

setlocal enabledelayedexpansion
color 0A

echo.
echo ============================================================
echo    GEC Event Portal - Local Setup
echo ============================================================
echo.

REM Check for Node.js installation
echo [1/4] Checking for Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo - Download the LTS (Long Term Support) version
    echo - Check "Add to PATH" during installation
    echo - Restart your computer after installation
    echo.
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check for npm
echo [2/4] Checking for npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: npm is not installed
    echo.
    echo npm should be installed with Node.js
    echo Try reinstalling Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm found: %NPM_VERSION%

REM Setup Backend
echo.
echo [3/4] Installing Backend Dependencies...
echo.

if not exist "backend\" (
    echo ❌ ERROR: backend folder not found!
    echo Please make sure you're in the gec-portal directory
    pause
    exit /b 1
)

cd backend

echo Installing packages (this may take a few minutes)...
call npm install

if errorlevel 1 (
    echo.
    echo ❌ ERROR: Backend npm install failed!
    echo.
    echo Possible solutions:
    echo - Check your internet connection
    echo - Delete backend\node_modules folder and try again
    echo - Run: npm cache clean --force
    echo.
    echo See TROUBLESHOOTING.md for more help
    pause
    cd ..
    exit /b 1
)

echo ✅ Backend dependencies installed successfully!

REM Setup Frontend
echo.
echo [4/4] Installing Frontend Dependencies...
echo.

cd ..

if not exist "frontend\" (
    echo ❌ ERROR: frontend folder not found!
    echo Please make sure you're in the gec-portal directory
    pause
    exit /b 1
)

cd frontend

echo Installing packages (this may take a few minutes)...
call npm install

if errorlevel 1 (
    echo.
    echo ❌ ERROR: Frontend npm install failed!
    echo.
    echo Possible solutions:
    echo - Check your internet connection
    echo - Delete frontend\node_modules folder and try again
    echo - Run: npm cache clean --force
    echo.
    echo See TROUBLESHOOTING.md for more help
    pause
    cd ..
    exit /b 1
)

echo ✅ Frontend dependencies installed successfully!

REM Success message
cd ..

echo.
echo ============================================================
echo    ✅ Setup Complete!
echo ============================================================
echo.
echo You're ready to start developing! Here's what to do next:
echo.
echo STEP 1 - Setup the Database
echo   Run: setup-database.bat
echo.
echo STEP 2 - Start the Backend Server
echo   Run: start-backend.bat
echo   (Keep this terminal open)
echo.
echo STEP 3 - Start the Frontend Server
echo   Run: start-frontend.bat
echo   (In a new terminal)
echo.
echo STEP 4 - Open Your Browser
echo   Go to: http://localhost:3000
echo.
echo ============================================================
echo.
echo 📖 For more information, see:
echo   - START_HERE.md
echo   - SETUP_LOCAL.md
echo   - TROUBLESHOOTING.md
echo.

pause
