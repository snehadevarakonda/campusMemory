@echo off
title Campus Memories Server
cd /d "%~dp0"

echo ============================================
echo   Campus Memories - Starting Server
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Install from https://nodejs.org then run this again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies ^(first time only^)...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
  echo.
)

echo Stopping any old server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo Starting server at http://localhost:3000
echo Keep this window OPEN while using the app.
echo Press Ctrl+C to stop the server.
echo.

start http://localhost:3000
node server.js

pause
