const { contextBridge } = require('electron')

// We are not exposing any APIs yet, but the file exists
// so Electron can load it successfully.
contextBridge.exposeInMainWorld('electronAPI', {
  // Functions for saving/loading will go here later
})
