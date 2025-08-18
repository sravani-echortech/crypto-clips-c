@echo off
echo 🚀 Building CryptoClips APK...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if Expo CLI is installed
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Expo CLI...
    npm install -g @expo/cli
)

REM Prebuild the project
echo 🔨 Prebuilding project...
npx expo prebuild --platform android

REM Build APK
echo 🏗️ Building APK...
cd android
gradlew clean
gradlew assembleRelease

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ APK built successfully!
    echo 📱 APK location: android\app\build\outputs\apk\release\app-release.apk
    for %%A in (android\app\build\outputs\apk\release\app-release.apk) do echo 📏 APK size: %%~zA bytes
) else (
    echo ❌ APK build failed!
    pause
    exit /b 1
)

pause

