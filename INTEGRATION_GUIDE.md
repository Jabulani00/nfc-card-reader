# Integration Guide - Student RFID Card System

## Project Structure

Your project should be organized like this:

```
nfc-card-reader/
├── app/                          # Your existing Expo app
│   ├── (tabs)/
│   │   └── my-card.tsx          # Replace with student-card-screen-modified.tsx
│   └── ...
├── backend/                      # NEW - Backend service folder
│   ├── usb-rfid-backend.js      # USB RFID reader service
│   ├── test-serial.js           # Serial port testing tool
│   ├── package.json             # Backend dependencies
│   └── node_modules/            # Backend npm packages
├── components/                   # Your existing components
├── hooks/                        # Your existing hooks
├── constants/                    # Your existing constants
├── package.json                  # Main project package.json
└── node_modules/                # Main project npm packages
```

---

## Step-by-Step Integration

### Step 1: Update Your Main Package.json

Replace your `package.json` with the integrated version provided. This adds:
- Backend management scripts
- Keeps all your existing dependencies
- Removes `node-emv` (no longer needed for credit cards)

**Changes made:**
```json
{
  "scripts": {
    "backend": "node backend/usb-rfid-backend.js",
    "backend:dev": "nodemon backend/usb-rfid-backend.js",
    "test:serial": "node backend/test-serial.js",
    "backend:install": "cd backend && npm install"
  }
}
```

**Note:** I removed `node-emv` since you won't need EMV processing for student RFID cards.

---

### Step 2: Create Backend Folder

```bash
# Create backend directory in your project root
mkdir backend

# Move the backend files
mv usb-rfid-backend.js backend/
mv test-serial.js backend/
mv backend-package.json backend/package.json
```

---

### Step 3: Install Backend Dependencies

```bash
# Install backend dependencies separately
cd backend
npm install

# Or use the script from root
cd ..
npm run backend:install
```

This installs:
- `express` - Web server
- `cors` - Cross-origin support
- `body-parser` - JSON parsing
- `serialport` - USB RFID reader communication
- `@serialport/parser-readline` - Serial data parsing
- `nodemon` - Dev auto-reload (optional)

---

### Step 4: Replace Your Card Screen Component

1. **Find your current card screen:**
   - Likely at: `app/(tabs)/my-card.tsx` or similar

2. **Backup the original:**
   ```bash
   cp app/(tabs)/my-card.tsx app/(tabs)/my-card.backup.tsx
   ```

3. **Replace with new version:**
   ```bash
   cp student-card-screen-modified.tsx app/(tabs)/my-card.tsx
   ```

4. **Update imports if needed:**
   Make sure all your imports match your project structure:
   ```typescript
   import { ThemedText } from '@/components/themed-text';
   import { ThemedView } from '@/components/themed-view';
   import { UserCardLoading } from '@/components/user-card-loading';
   import { Colors } from '@/constants/colors';
   import { useColorScheme } from '@/hooks/use-color-scheme';
   import { useUserCard } from '@/hooks/use-user-card';
   ```

---

### Step 5: Configure the Backend

Edit `backend/usb-rfid-backend.js` to configure your USB reader:

```javascript
const CONFIG = {
  PORT: 8081,                    // Backend server port
  SERIAL_PORT: '/dev/ttyUSB0',   // ← UPDATE THIS
  BAUD_RATE: 9600,               // ← UPDATE THIS if needed
  CARD_ID_FORMAT: 'hex',         // 'hex' or 'decimal'
};
```

**Finding your serial port:**

#### On Linux:
```bash
ls /dev/tty*
# Common: /dev/ttyUSB0, /dev/ttyACM0
```

#### On macOS:
```bash
ls /dev/cu.*
# Common: /dev/cu.usbserial-*
```

#### On Windows:
- Open Device Manager
- Look under "Ports (COM & LPT)"
- Use: `COM3`, `COM4`, etc.

---

### Step 6: Test Your USB RFID Reader

Before running the full backend, test if your reader works:

```bash
npm run test:serial
```

This will:
1. List all available serial ports
2. Let you select your RFID reader port
3. Show raw data when you scan a card
4. Help identify the correct baud rate and format

**Expected output:**
```
📋 Found 2 serial port(s):

1. /dev/ttyUSB0
   Manufacturer: FTDI
   
2. /dev/ttyACM0
   Manufacturer: Arduino

Enter port number to test: 1
Enter baud rate (default: 9600): 

✅ Port opened successfully
👂 Listening for data...

[Scan a card]

✨ DATA RECEIVED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Raw (hex):   041A2B3C
Raw (ASCII): ...
Length:      4 bytes

🎴 Possible Card ID Formats:
   1. Hex: 041A2B3C
   2. Hex (formatted): 04:1A:2B:3C
```

---

### Step 7: Start the Backend Service

Once testing is successful, start the backend:

```bash
# Production mode
npm run backend

# Development mode (auto-restart on changes)
npm run backend:dev
```

**Expected output:**
```
🚀 USB RFID Reader Service Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on http://localhost:8081
🔌 Serial port: /dev/ttyUSB0
⚡ Baud rate: 9600
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Available endpoints:
   GET  /health
   GET  /recent-scans
   POST /verify-student-card
   POST /register-card
   GET  /student/:cardId
   POST /check-access
```

---

### Step 8: Update API Endpoint in React Native

In your `student-card-screen-modified.tsx` (or wherever you placed it), update the API URL:

```typescript
const verifyStudentCard = async (cardId: string, studentData: any) => {
  try {
    // For local development on same machine:
    const API_URL = 'http://localhost:8081';
    
    // For testing on physical device, use your computer's local IP:
    // const API_URL = 'http://192.168.1.100:8081';
    
    // For production, use your server:
    // const API_URL = 'https://your-server.com';
    
    const response = await fetch(`${API_URL}/verify-student-card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cardId, 
        studentData,
        timestamp: new Date().toISOString(),
      }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.log('Verification error:', error);
    return { success: false, error: 'Network error' };
  }
};
```

**Important:** If testing on a physical mobile device, you need to use your computer's IP address, not `localhost`.

To find your computer's IP:
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

---

### Step 9: Run Your Expo App

Now start your Expo app:

```bash
# Start Expo
npm start

# Or directly on device
npm run android  # for Android
npm run ios      # for iOS
```

---

### Step 10: Test the Integration

1. **Start the backend:**
   ```bash
   npm run backend
   ```

2. **Start your app:**
   ```bash
   npm start
   ```

3. **Test the flow:**
   - Open your app
   - Navigate to "My Card" tab
   - Tap "Scan Physical Card"
   - Hold an RFID card to your USB reader
   - See the card info appear in your app

---

## Running Both Services Together

### Option 1: Use Two Terminals

**Terminal 1 (Backend):**
```bash
npm run backend
```

**Terminal 2 (Expo App):**
```bash
npm start
```

### Option 2: Use a Process Manager

Install PM2:
```bash
npm install -g pm2
```

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'rfid-backend',
      script: './backend/usb-rfid-backend.js',
      watch: false,
    },
    {
      name: 'expo-app',
      script: 'npm',
      args: 'start',
      watch: false,
    }
  ]
};
```

Start both:
```bash
pm2 start ecosystem.config.js
```

### Option 3: Use Concurrently (Recommended)

Install:
```bash
npm install --save-dev concurrently
```

Update `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run backend\" \"npm start\"",
    "dev:all": "concurrently \"npm run backend:dev\" \"npm start\""
  }
}
```

Run both:
```bash
npm run dev
```

---

## Troubleshooting Integration Issues

### Issue 1: Cannot find module 'express'

**Solution:**
```bash
cd backend
npm install
```

### Issue 2: Port 8081 already in use

**Solution:**
```bash
# Find process
lsof -i :8081
# Kill process
kill -9 <PID>

# Or change port in backend/usb-rfid-backend.js
const CONFIG = {
  PORT: 8082,  // Use different port
  // ...
};
```

### Issue 3: Cannot connect to backend from mobile device

**Solutions:**

1. **Check firewall:**
   ```bash
   # Linux
   sudo ufw allow 8081
   
   # Mac
   # System Preferences → Security & Privacy → Firewall → Options
   ```

2. **Use correct IP:**
   ```typescript
   // Not localhost - use your computer's IP
   const API_URL = 'http://192.168.1.100:8081';
   ```

3. **Both devices on same network:**
   - Computer and phone must be on same WiFi

### Issue 4: EACCES permission denied (serial port)

**Solution (Linux/Mac):**
```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER

# Or temporary fix
sudo chmod 666 /dev/ttyUSB0

# Then logout and login
```

### Issue 5: Module not found errors in React Native

**Solution:**
```bash
# Clear cache
expo start --clear

# Or
npx expo start -c
```

---

## Testing Checklist

- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] USB RFID reader connected and detected
- [ ] Serial port configured correctly
- [ ] Test script runs successfully (`npm run test:serial`)
- [ ] Backend starts without errors (`npm run backend`)
- [ ] Health endpoint works (`curl http://localhost:8081/health`)
- [ ] Expo app starts successfully
- [ ] Can navigate to My Card screen
- [ ] "Scan Physical Card" button appears
- [ ] Scanning a card shows data in backend logs
- [ ] Card verification works
- [ ] Success/failure alerts appear in app

---

## Development Workflow

### Daily Development:

1. **Start backend:**
   ```bash
   npm run backend:dev
   ```

2. **Start Expo:**
   ```bash
   npm start
   ```

3. **Test with physical device:**
   - Scan QR code from Expo
   - Or: `npm run android` / `npm run ios`

### Adding Test Cards:

Edit `backend/usb-rfid-backend.js`:
```javascript
const studentDatabase = new Map([
  ['04:1A:2B:3C', {
    id: 'STU12345',
    firstName: 'John',
    lastName: 'Doe',
    // ... your test data
  }],
  // Add more test cards here
]);
```

### Debugging:

**Backend logs:**
- Watch backend terminal for card scans
- Check HTTP request logs
- Monitor serial port data

**App logs:**
```bash
# View logs
npx expo start

# In Metro bundler:
# Press 'j' to open debugger
```

---

## Production Deployment

### 1. Backend Deployment:

**Option A: VPS/Cloud Server**
```bash
# SSH to server
ssh user@your-server.com

# Clone/upload your code
git clone your-repo
cd backend

# Install dependencies
npm install --production

# Use PM2
pm2 start usb-rfid-backend.js --name rfid-service
pm2 save
pm2 startup
```

**Option B: Raspberry Pi**
```bash
# On Raspberry Pi
cd /home/pi/nfc-backend
npm install

# Run on boot
crontab -e
# Add: @reboot cd /home/pi/nfc-backend && npm start
```

### 2. App Deployment:

Update API URL in production:
```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com'
  : 'http://localhost:8081';
```

Build for production:
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

---

## Next Steps

1. ✅ Complete integration steps above
2. 🔄 Test with actual RFID cards
3. 🔄 Add your student database
4. 🔄 Implement authentication
5. 🔄 Add logging and analytics
6. 🔄 Set up production environment
7. 🔄 Deploy and monitor

---

## Additional Resources

- **Expo Documentation:** https://docs.expo.dev
- **React Native NFC Manager:** https://github.com/revtel/react-native-nfc-manager
- **SerialPort Documentation:** https://serialport.io
- **Express.js Guide:** https://expressjs.com

---

## Support

If you encounter issues:
1. Check backend logs
2. Check Expo logs
3. Verify USB connection
4. Test serial port with test script
5. Check network connectivity
6. Review the SETUP_GUIDE.md and IMPLEMENTATION_GUIDE.md

Good luck with your student RFID card system! 🎓📱
