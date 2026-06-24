@echo off
chcp 65001 >nul
cd /d "%~dp0backend"
echo ========================================
echo   正在启动教材管理系统后端...
echo ========================================
call D:\Java\maven\bin\mvn.cmd spring-boot:run -DskipTests
pause
