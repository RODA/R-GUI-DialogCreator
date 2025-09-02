// preload.js
// Expose safe Electron APIs to renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => {
                func(event, ...args);
            });
        },
        once: (channel, func) => ipcRenderer.once(channel, (event, ...args) => {
            func(event, ...args);
        }),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
    }
    // Add more APIs as needed (e.g., dialog, etc.)
});
