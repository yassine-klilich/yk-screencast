const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const adb = require('@devicefarmer/adbkit').default;

let mainWindow;
let scrcpyProcess = null;
const client = adb.createClient();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#1e1e1e',
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopScreencast();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopScreencast();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-devices', async () => {
  try {
    const devices = await client.listDevices();
    return devices.map(device => ({
      id: device.id,
      type: device.type
    }));
  } catch (error) {
    console.error('Error listing devices:', error);
    return [];
  }
});

ipcMain.handle('get-device-info', async (event, deviceId) => {
  try {
    const device = client.getDevice(deviceId);
    const properties = await device.getProperties();
    return {
      model: properties['ro.product.model'],
      manufacturer: properties['ro.product.manufacturer'],
      version: properties['ro.build.version.release'],
      sdk: properties['ro.build.version.sdk']
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
});

ipcMain.handle('start-screencast', async (event, deviceId, options = {}) => {
  try {
    if (scrcpyProcess) {
      stopScreencast();
    }

    // Check if scrcpy is installed
    const scrcpyPath = await findScrcpy();
    if (!scrcpyPath) {
      return {
        success: false,
        error: 'scrcpy not found. Please install scrcpy first.'
      };
    }

    const args = [
      '-s', deviceId,
      '--max-size', options.maxSize || '1024',
      '--bit-rate', options.bitRate || '8M',
      '--max-fps', options.maxFps || '60',
      '--window-title', 'Phone Screen',
      '--window-borderless',
      '--always-on-top',
      '--stay-awake'
    ];

    if (options.recordScreen) {
      args.push('--record', `recording-${Date.now()}.mp4`);
    }

    scrcpyProcess = spawn(scrcpyPath, args);

    scrcpyProcess.on('error', (error) => {
      console.error('Scrcpy error:', error);
      mainWindow.webContents.send('screencast-error', error.message);
    });

    scrcpyProcess.on('exit', (code) => {
      console.log(`Scrcpy exited with code ${code}`);
      scrcpyProcess = null;
      mainWindow.webContents.send('screencast-stopped');
    });

    return { success: true };
  } catch (error) {
    console.error('Error starting screencast:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-screencast', async () => {
  stopScreencast();
  return { success: true };
});

function stopScreencast() {
  if (scrcpyProcess) {
    scrcpyProcess.kill();
    scrcpyProcess = null;
  }
}

async function findScrcpy() {
  // Try to find scrcpy in PATH
  return new Promise((resolve) => {
    const testCommand = process.platform === 'win32' ? 'where' : 'which';
    const test = spawn(testCommand, ['scrcpy']);
    
    let output = '';
    test.stdout.on('data', (data) => {
      output += data.toString();
    });

    test.on('close', (code) => {
      if (code === 0 && output.trim()) {
        resolve(output.trim().split('\n')[0]);
      } else {
        resolve(null);
      }
    });

    test.on('error', () => {
      resolve(null);
    });
  });
}

// Check ADB installation on startup
async function checkAdbInstallation() {
  try {
    const version = await client.version();
    console.log('ADB version:', version);
    return true;
  } catch (error) {
    console.error('ADB not found or not running');
    return false;
  }
}

app.whenReady().then(async () => {
  const adbInstalled = await checkAdbInstallation();
  if (!adbInstalled) {
    console.warn('Warning: ADB may not be installed or configured properly');
  }
});
