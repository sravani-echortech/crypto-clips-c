#!/bin/bash

echo "🚀 Building CryptoClips APK..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Prebuild the project
echo "🔨 Prebuilding project..."
npx expo prebuild --platform android

# Build APK
echo "🏗️ Building APK..."
cd android
./gradlew clean
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"
    echo "📏 APK size: $(du -h android/app/build/outputs/apk/release/app-release.apk | cut -f1)"
else
    echo "❌ APK build failed!"
    exit 1
fi

