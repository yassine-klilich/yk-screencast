const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Get list of connected devices
  getDevices: () => ipcRenderer.invoke('get-devices'),
  
  // Get detailed information about a specific device
  getDeviceInfo: (deviceId) => ipcRenderer.invoke('get-device-info', deviceId),
  
  // Start screen mirroring
  startScreencast: (deviceId, options) => ipcRenderer.invoke('start-screencast', deviceId, options),
  
  // Stop screen mirroring
  stopScreencast: () => ipcRenderer.invoke('stop-screencast'),
  
  // Listen for screencast errors
  onScreencastError: (callback) => {
    ipcRenderer.on('screencast-error', (event, error) => callback(error));
  },
  
  // Listen for screencast stopped event
  onScreencastStopped: (callback) => {
    ipcRenderer.on('screencast-stopped', () => callback());
  }
});
