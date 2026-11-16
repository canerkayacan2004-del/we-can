// Arayuze yalnizca dar ve guvenli bir kopru acar.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wecanDesktop', {
  getAppInfo: () => ipcRenderer.invoke('app:info'),
});
