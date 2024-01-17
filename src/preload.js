// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    readClipboard: () => ipcRenderer.invoke("read-clipboard"),
    clearClipboard: () => ipcRenderer.invoke("clear-clipboard"),
});
