@echo off
REM Create all necessary directories for registration system

echo Creating backend directories...
if not exist "backend\controllers" mkdir backend\controllers
if not exist "backend\routes" mkdir backend\routes

echo Creating frontend directories...
if not exist "frontend\src" mkdir frontend\src
if not exist "frontend\src\pages" mkdir frontend\src\pages
if not exist "frontend\src\pages\student" mkdir frontend\src\pages\student
if not exist "frontend\src\pages\club" mkdir frontend\src\pages\club
if not exist "frontend\src\pages\events" mkdir frontend\src\pages\events
if not exist "frontend\src\components" mkdir frontend\src\components
if not exist "frontend\src\services" mkdir frontend\src\services

echo.
echo ✅ All directories created successfully!
