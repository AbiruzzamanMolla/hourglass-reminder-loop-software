const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  hideToTray: () => ipcRenderer.send('window-hide-to-tray'),
  closeApp: () => ipcRenderer.send('app-quit'),
  notify: (title, body) => ipcRenderer.send('send-notification', { title, body }),
  updateTrayTooltip: (text) => ipcRenderer.send('update-tray-tooltip', text),
  onTimerAction: (callback) => {
    ipcRenderer.on('tray-timer-action', (_event, action) => callback(action));
  }
});
