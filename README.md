# Phone Screencast App

A desktop application built with Electron.js that allows you to cast your Android phone screen to your computer via USB.

## Features

- 📱 **USB Screen Mirroring**: Cast your Android phone screen in real-time
- 🔍 **Device Detection**: Automatically detect connected Android devices
- ⚙️ **Customizable Settings**: Adjust resolution, bit rate, and FPS
- 📊 **Device Information**: View detailed information about connected devices
- 🎨 **Modern UI**: Beautiful and intuitive user interface

## Prerequisites

Before using this app, you need to install the following tools:

### 1. ADB (Android Debug Bridge)

**Windows:**

- Download from [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools)
- Extract and add to PATH

**Mac:**

```bash
brew install android-platform-tools
```

**Linux:**

```bash
sudo apt install adb
```

### 2. scrcpy

**Windows:**

```bash
scoop install scrcpy
```

Or download from [GitHub](https://github.com/Genymobile/scrcpy)

**Mac:**

```bash
brew install scrcpy
```

**Linux:**

```bash
sudo apt install scrcpy
```

### 3. Enable USB Debugging on Android

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times to enable Developer Options
3. Go to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Connect your phone via USB
6. Accept the USB debugging prompt on your phone

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

## Usage

### Development Mode

```bash
npm start
```

### Production Build

```bash
npm run build
```

The built application will be in the `dist` folder.

## How to Use

1. **Connect your Android device** via USB cable
2. **Accept the USB debugging prompt** on your phone
3. **Launch the app** and click "Refresh Devices"
4. **Select your device** from the list
5. **Adjust settings** (resolution, bit rate, FPS) if desired
6. **Click "Start Screencast"** to begin mirroring

## Features Breakdown

### Device Management

- Automatic device detection
- Multiple device support
- Device information display (model, manufacturer, Android version)

### Screen Mirroring

- High-quality video streaming
- Low latency
- Configurable resolution (720p, 1024p, 1080p)
- Adjustable bit rate (4M, 8M, 16M)
- Customizable FPS (30, 60)

### User Interface

- Clean and modern design
- Real-time status updates
- Easy-to-use controls
- Responsive layout

## Technical Details

### Built With

- **Electron.js**: Desktop application framework
- **ADBKit**: Node.js library for ADB communication
- **scrcpy**: Screen mirroring tool
- **HTML/CSS/JavaScript**: Frontend interface

### Project Structure

```
screencast/
├── main.js           # Electron main process
├── preload.js        # Preload script for IPC
├── renderer.js       # Renderer process logic
├── index.html        # Main UI
├── styles.css        # Styling
├── package.json      # Project configuration
└── README.md         # Documentation
```

## Troubleshooting

### No devices found

- Make sure USB debugging is enabled on your phone
- Try different USB cables or ports
- Check if ADB recognizes your device: `adb devices`
- Restart ADB server: `adb kill-server && adb start-server`

### scrcpy not found

- Verify scrcpy is installed: `scrcpy --version`
- Make sure scrcpy is in your system PATH
- Reinstall scrcpy if necessary

### Connection issues

- Ensure your phone is unlocked
- Try revoking and re-authorizing USB debugging
- Check USB cable quality (use data cable, not charging-only cable)

## License

MIT License - Feel free to use and modify this project.

## Credits

- [Electron](https://www.electronjs.org/)
- [scrcpy](https://github.com/Genymobile/scrcpy)
- [ADBKit](https://github.com/DeviceFarmer/adbkit)

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.
# yk-screencast
