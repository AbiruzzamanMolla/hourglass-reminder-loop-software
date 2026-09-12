const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Configure unique user-data and cache path to avoid permission collision on Windows
const customUserDataPath = path.join(app.getPath('appData'), 'hourglass-timer-app');
app.setPath('userData', customUserDataPath);
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// Generate crisp 16x16 PNG tray icon programmatically
function createTrayIcon() {
  const size = 16;
  const canvasBuffer = Buffer.alloc(size * size * 4);

  // Draw an hourglass shape in 16x16 RGBA buffer
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      // Top bar & Bottom bar
      const isTopBottomBar = (y === 1 || y === 14) && (x >= 2 && x <= 13);
      // Top cone
      const isTopCone = (y >= 2 && y <= 7) && (x >= y && x <= 15 - y);
      // Bottom cone
      const isBottomCone = (y >= 8 && y <= 13) && (x >= (15 - y) && x <= y);

      if (isTopBottomBar) {
        // Amber/Golden frame
        canvasBuffer[idx] = 217;     // R
        canvasBuffer[idx + 1] = 119; // G
        canvasBuffer[idx + 2] = 6;   // B
        canvasBuffer[idx + 3] = 255; // A
      } else if (isTopCone || isBottomCone) {
        // Warm sand yellow
        canvasBuffer[idx] = 252;     // R
        canvasBuffer[idx + 1] = 211; // G
        canvasBuffer[idx + 2] = 77;  // B
        canvasBuffer[idx + 3] = 240; // A
      } else {
        canvasBuffer[idx] = 0;
        canvasBuffer[idx + 1] = 0;
        canvasBuffer[idx + 2] = 0;
        canvasBuffer[idx + 3] = 0;
      }
    }
  }

  return nativeImage.createFromBuffer(canvasBuffer, { width: size, height: size });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 650,
    minWidth: 380,
    minHeight: 560,
    maxWidth: 600,
    maxHeight: 850,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false // Keep countdown precise when window is hidden/minimized
    },
    icon: createTrayIcon()
  });

  mainWindow.loadFile('index.html');

  // Intercept window close (X button or Alt+F4) and hide to system tray instead
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      if (tray && Notification.isSupported()) {
        new Notification({
          title: 'Hourglass Running in Background',
          body: 'Your timer is still running in the system tray. Click the tray icon to restore.',
          icon: createTrayIcon()
        }).show();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('Hourglass Timer');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Hourglass',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Start / Pause',
      click: () => {
        if (mainWindow) mainWindow.webContents.send('tray-timer-action', 'toggle');
      }
    },
    {
      label: 'Reset Timer',
      click: () => {
        if (mainWindow) mainWindow.webContents.send('tray-timer-action', 'reset');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit App',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Left click / Double click to restore window
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });
}

// IPC Handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-hide-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('app-quit', () => {
  isQuitting = true;
  app.quit();
});

ipcMain.on('update-tray-tooltip', (_event, text) => {
  if (tray) {
    tray.setToolTip(`Hourglass: ${text}`);
  }
});

ipcMain.on('send-notification', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || 'Timer Finished!',
      body: body || 'Your hourglass timer has completed.',
      icon: createTrayIcon()
    }).show();
  }
});

ipcMain.handle('select-audio-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Alert Sound File',
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1).toLowerCase();
      const mime = ext === 'mp3' ? 'audio/mpeg' : ext === 'wav' ? 'audio/wav' : ext === 'ogg' ? 'audio/ogg' : 'audio/*';
      const dataUri = `data:${mime};base64,${data.toString('base64')}`;
      return { name: fileName, dataUri };
    } catch (err) {
      console.error('Error reading audio file:', err);
      return null;
    }
  }
  return null;
});

app.whenReady().then(() => {
  createWindow();
  setupTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (isQuitting) {
      app.quit();
    }
  }
});
