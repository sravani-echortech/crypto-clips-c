# 🔧 Expo Development Server Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue 1: QR Code Not Working / App Not Loading**

#### **Solution A: Use Tunnel Mode (Recommended)**
```bash
# Stop current server (Ctrl+C)
# Then restart with tunnel
npx expo start --tunnel
```

**Why this works:** Tunnel mode creates a secure tunnel that works even when your phone and computer are on different networks.

#### **Solution B: Check Network Connection**
1. **Ensure both devices are on the same WiFi network**
2. **Check firewall settings** - Windows Defender might block the connection
3. **Try disabling antivirus temporarily**

#### **Solution C: Use LAN Mode**
```bash
npx expo start --lan
```

### **Issue 2: "Unable to resolve module" Errors**

#### **Solution: Clear Cache**
```bash
# Clear Expo cache
npx expo start --clear

# Clear Metro cache
npx expo start --reset-cache

# Clear npm cache
npm cache clean --force
```

### **Issue 3: Port Already in Use**

#### **Solution: Use Different Port**
```bash
# Use port 8083 instead of 8083
npx expo start --port 8083

# Or let Expo choose automatically
npx expo start
```

### **Issue 4: Expo Go App Issues**

#### **Solution: Update Expo Go**
1. **Update Expo Go** from App Store/Google Play
2. **Clear Expo Go cache** (Settings → Clear Cache)
3. **Restart Expo Go app**

## 📱 **Step-by-Step Connection Guide**

### **Step 1: Start Development Server**
```bash
# Method 1: Standard (same network)
npx expo start

# Method 2: Tunnel (different networks)
npx expo start --tunnel

# Method 3: LAN (local network)
npx expo start --lan
```

### **Step 2: Scan QR Code**
1. **Open Expo Go app** on your phone
2. **Tap "Scan QR Code"**
3. **Point camera at the QR code** in your terminal
4. **Wait for app to load**

### **Step 3: Alternative Connection Methods**

#### **Method A: Manual URL Entry**
1. Look for the URL in your terminal (e.g., `exp://192.168.1.100:8081`)
2. In Expo Go, tap "Enter URL manually"
3. Type the URL and tap "Connect"

#### **Method B: Email Link**
1. In terminal, press `e` to send email
2. Check your email on phone
3. Tap the link in the email

## 🔍 **Debugging Steps**

### **Step 1: Check Server Status**
```bash
# Check if server is running
netstat -an | findstr :8081

# Check Expo CLI version
npx expo --version
```

### **Step 2: Check Network**
```bash
# Test local network
ping 192.168.1.1

# Check your IP address
ipconfig
```

### **Step 3: Check Dependencies**
```bash
# Reinstall dependencies
npm install

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## 🛠️ **Advanced Solutions**

### **Solution 1: Use Development Build**
If Expo Go doesn't work, create a development build:
```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Create development build
npx expo run:android
```

### **Solution 2: Use Physical Device**
1. **Enable USB debugging** on your Android device
2. **Connect via USB**
3. **Run:**
   ```bash
   npx expo run:android
   ```

### **Solution 3: Use Android Emulator**
1. **Open Android Studio**
2. **Start an emulator**
3. **Run:**
   ```bash
   npx expo run:android
   ```

## 📋 **Checklist**

Before trying to connect:

- [ ] **Expo Go app is updated**
- [ ] **Both devices are on same network** (or using tunnel)
- [ ] **Firewall is not blocking connection**
- [ ] **Port 8081 is available**
- [ ] **Dependencies are installed** (`npm install`)
- [ ] **No syntax errors in code**

## 🚀 **Quick Fix Commands**

```bash
# 1. Clear everything and restart
npm cache clean --force
rm -rf node_modules
npm install
npx expo start --tunnel --clear

# 2. If that doesn't work, try development build
npx expo install expo-dev-client
npx expo run:android

# 3. Last resort - rebuild everything
npx expo prebuild --clean
npx expo run:android
```

## 📞 **Still Having Issues?**

1. **Check the terminal output** for specific error messages
2. **Try different connection methods** (tunnel, LAN, USB)
3. **Update all tools:**
   ```bash
   npm update -g @expo/cli
   npm update
   ```
4. **Check Expo status page** for service issues
5. **Try on a different device/network**

---

**Most Common Solution:** Use `npx expo start --tunnel` and make sure your Expo Go app is updated! 🎯

