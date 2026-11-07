let selectedDevice = null;
let isScreencasting = false;

// DOM Elements
const refreshBtn = document.getElementById('refreshBtn');
const deviceList = document.getElementById('deviceList');
const deviceInfo = document.getElementById('deviceInfo');
const deviceDetails = document.getElementById('deviceDetails');
const controls = document.getElementById('controls');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusBar = document.getElementById('statusBar');
const statusText = document.getElementById('statusText');
const maxSize = document.getElementById('maxSize');
const bitRate = document.getElementById('bitRate');
const maxFps = document.getElementById('maxFps');

// Event Listeners
refreshBtn.addEventListener('click', refreshDevices);
startBtn.addEventListener('click', startScreencast);
stopBtn.addEventListener('click', stopScreencast);

// Initialize
refreshDevices();

async function refreshDevices() {
  updateStatus('Searching for devices...', 'loading');
  deviceList.innerHTML = '<div class="loading">Searching for devices...</div>';
  
  try {
    const devices = await window.electronAPI.getDevices();
    
    if (devices.length === 0) {
      deviceList.innerHTML = `
        <div class="no-devices">
          <p>⚠️ No devices found</p>
          <p class="hint">Make sure USB debugging is enabled and your phone is connected</p>
        </div>
      `;
      deviceInfo.style.display = 'none';
      controls.style.display = 'none';
      updateStatus('No devices found', 'error');
      return;
    }

    deviceList.innerHTML = '';
    devices.forEach(device => {
      const deviceCard = createDeviceCard(device);
      deviceList.appendChild(deviceCard);
    });

    updateStatus(`Found ${devices.length} device(s)`, 'success');
  } catch (error) {
    console.error('Error refreshing devices:', error);
    deviceList.innerHTML = `
      <div class="error">
        <p>❌ Error: ${error.message}</p>
        <p class="hint">Make sure ADB is installed and running</p>
      </div>
    `;
    updateStatus('Error loading devices', 'error');
  }
}

function createDeviceCard(device) {
  const card = document.createElement('div');
  card.className = 'device-card';
  card.innerHTML = `
    <div class="device-icon">📱</div>
    <div class="device-name">
      <strong>${device.id}</strong>
      <span class="device-status ${device.type}">${device.type}</span>
    </div>
  `;
  
  card.addEventListener('click', () => selectDevice(device.id, card));
  return card;
}

async function selectDevice(deviceId, cardElement) {
  // Remove previous selection
  document.querySelectorAll('.device-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Mark as selected
  cardElement.classList.add('selected');
  selectedDevice = deviceId;
  
  updateStatus('Loading device information...', 'loading');
  
  try {
    const info = await window.electronAPI.getDeviceInfo(deviceId);
    
    if (info) {
      deviceDetails.innerHTML = `
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Device ID:</span>
            <span class="info-value">${deviceId}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Manufacturer:</span>
            <span class="info-value">${info.manufacturer || 'Unknown'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Model:</span>
            <span class="info-value">${info.model || 'Unknown'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Android Version:</span>
            <span class="info-value">${info.version || 'Unknown'} (API ${info.sdk || 'Unknown'})</span>
          </div>
        </div>
      `;
      deviceInfo.style.display = 'block';
      controls.style.display = 'block';
      updateStatus('Device selected', 'success');
    }
  } catch (error) {
    console.error('Error getting device info:', error);
    updateStatus('Error loading device info', 'error');
  }
}

async function startScreencast() {
  if (!selectedDevice) {
    updateStatus('Please select a device first', 'error');
    return;
  }

  updateStatus('Starting screencast...', 'loading');
  startBtn.disabled = true;

  const options = {
    maxSize: maxSize.value,
    bitRate: bitRate.value,
    maxFps: maxFps.value
  };

  try {
    const result = await window.electronAPI.startScreencast(selectedDevice, options);
    
    if (result.success) {
      isScreencasting = true;
      startBtn.style.display = 'none';
      stopBtn.style.display = 'inline-flex';
      updateStatus('Screencast active', 'success');
      
      // Disable options while streaming
      maxSize.disabled = true;
      bitRate.disabled = true;
      maxFps.disabled = true;
    } else {
      startBtn.disabled = false;
      updateStatus(`Error: ${result.error}`, 'error');
      
      if (result.error.includes('scrcpy not found')) {
        showScrcpyNotFoundError();
      }
    }
  } catch (error) {
    console.error('Error starting screencast:', error);
    startBtn.disabled = false;
    updateStatus('Failed to start screencast', 'error');
  }
}

async function stopScreencast() {
  updateStatus('Stopping screencast...', 'loading');
  
  try {
    await window.electronAPI.stopScreencast();
    isScreencasting = false;
    startBtn.style.display = 'inline-flex';
    stopBtn.style.display = 'none';
    startBtn.disabled = false;
    
    // Re-enable options
    maxSize.disabled = false;
    bitRate.disabled = false;
    maxFps.disabled = false;
    
    updateStatus('Screencast stopped', 'success');
  } catch (error) {
    console.error('Error stopping screencast:', error);
    updateStatus('Error stopping screencast', 'error');
  }
}

function updateStatus(message, type = 'info') {
  statusText.textContent = message;
  statusBar.className = 'status-bar status-' + type;
}

function showScrcpyNotFoundError() {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-modal';
  errorDiv.innerHTML = `
    <div class="error-content">
      <h3>⚠️ scrcpy Not Found</h3>
      <p>scrcpy is required for screen mirroring but was not found on your system.</p>
      <p><strong>To install scrcpy:</strong></p>
      <ul>
        <li>Windows: <code>scoop install scrcpy</code></li>
        <li>Mac: <code>brew install scrcpy</code></li>
        <li>Linux: <code>sudo apt install scrcpy</code></li>
      </ul>
      <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary">Close</button>
    </div>
  `;
  document.body.appendChild(errorDiv);
}

// Listen for screencast events from main process
window.electronAPI.onScreencastError((error) => {
  console.error('Screencast error:', error);
  updateStatus(`Screencast error: ${error}`, 'error');
  stopScreencast();
});

window.electronAPI.onScreencastStopped(() => {
  console.log('Screencast stopped by external event');
  isScreencasting = false;
  startBtn.style.display = 'inline-flex';
  stopBtn.style.display = 'none';
  startBtn.disabled = false;
  maxSize.disabled = false;
  bitRate.disabled = false;
  maxFps.disabled = false;
  updateStatus('Screencast stopped', 'info');
});
