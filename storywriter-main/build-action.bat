@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

call yarn electron:build --win

echo Copying default story...
copy /Y default.ysd .\dist_electron\win-unpacked
copy /Y default.ysd .\dist_electron\win-ia32-unpacked
copy /Y home.json .\dist_electron\win-unpacked
copy /Y home.json .\dist_electron\win-ia32-unpacked

explorer .\dist_electron