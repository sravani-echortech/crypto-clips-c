# 📱 CryptoClips APK Building Guide

This guide will help you build an APK file for the CryptoClips React Native application.

## 🛠️ Prerequisites

Before building, ensure you have the following installed:

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Java Development Kit (JDK)** 11 or higher - [Download here](https://adoptium.net/)
- **Android Studio** - [Download here](https://developer.android.com/studio)
- **Android SDK** (installed via Android Studio)

### Environment Setup

1. **Set JAVA_HOME environment variable:**
   ```bash
   # Windows
   set JAVA_HOME=C:\Program Files\Java\jdk-11.0.x
   
   # macOS/Linux
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.0.x.jdk/Contents/Home
   ```

2. **Set ANDROID_HOME environment variable:**
   ```bash
   # Windows
   set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
   
   # macOS/Linux
   export ANDROID_HOME=$HOME/Library/Android/sdk
   ```

3. **Add Android SDK tools to PATH:**
   ```bash
   # Windows
   set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
   
   # macOS/Linux
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
   ```

## 🚀 Building Methods

### Method 1: Quick Build (Recommended)

#### Windows
```bash
# Run the build script
build-apk.bat
```

#### macOS/Linux
```bash
# Make script executable
chmod +x build-apk.sh

# Run the build script
./build-apk.sh
```

### Method 2: Manual Build

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Expo CLI globally:**
   ```bash
   npm install -g @expo/cli
   ```

3. **Prebuild the project:**
   ```bash
   npx expo prebuild --platform android
   ```

4. **Build the APK:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

### Method 3: EAS Build (Cloud)

1. **Install EAS CLI:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Login to Expo:**
   ```bash
   npx eas-cli login
   ```

3. **Configure EAS:**
   ```bash
   npx eas-cli build:configure
   ```

4. **Build APK:**
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

## 📦 APK Location

After successful build, your APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 🔐 Signing for Release

For production releases, you need to sign your APK:

1. **Generate a keystore:**
   ```bash
   keytool -genkey -v -keystore cryptoclips.keystore -alias cryptoclips -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing in `android/gradle.properties`:**
   ```properties
   MYAPP_UPLOAD_STORE_FILE=cryptoclips.keystore
   MYAPP_UPLOAD_KEY_ALIAS=cryptoclips
   MYAPP_UPLOAD_STORE_PASSWORD=your_password
   MYAPP_UPLOAD_KEY_PASSWORD=your_password
   ```

3. **Build signed APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

## 🐛 Troubleshooting

### Common Issues

1. **"Command not found: gradlew"**
   - Make sure you're in the `android` directory
   - Run `npx expo prebuild` first

2. **"SDK location not found"**
   - Set ANDROID_HOME environment variable
   - Install Android SDK via Android Studio

3. **"Java version not compatible"**
   - Install JDK 11 or higher
   - Set JAVA_HOME environment variable

4. **"Build failed"**
   - Clean the project: `cd android && ./gradlew clean`
   - Check for missing dependencies
   - Ensure all environment variables are set

### Build Optimization

1. **Reduce APK size:**
   - Enable ProGuard in `android/app/build.gradle`
   - Use APK splitting for different architectures

2. **Faster builds:**
   - Use Gradle daemon
   - Increase memory allocation in `gradle.properties`

## 📱 Testing the APK

1. **Install on device:**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

2. **Enable USB debugging** on your Android device
3. **Connect device** via USB
4. **Install and test** the application

## 🔄 Continuous Integration

For automated builds, you can use:
- **GitHub Actions**
- **Jenkins**
- **CircleCI**
- **EAS Build** (Expo's cloud service)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the build logs for specific error messages
3. Ensure all prerequisites are properly installed
4. Try cleaning and rebuilding the project

---

**Happy Building! 🎉**

