@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

call yarn electron:build --win
rem yarn electron:build --mac

echo Copying default story...
copy /Y default.ysd .\dist_electron\win-unpacked
copy /Y default.ysd .\dist_electron\win-ia32-unpacked
rem copy default.ysd ./dist_electron/mac