const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs/promises')

// A more reliable way to check for dev mode
const isDev = !app.isPackaged

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  if (isDev) {
    // In dev mode, load from the Vite dev server
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// This is the key part for initial launch.
// Create a window when the app is ready.
app.whenReady().then(createWindow)

// This is a key part for macOS.
// Do not quit the app when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// This is a key part for macOS.
// Re-create a window when the dock icon is clicked and no other windows are open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Handle the 'save-file' message from the preload script
ipcMain.handle('save-file', async (event, data) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save Family Tree',
    defaultPath: 'family-tree.json',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  })

  if (filePath) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
      return { success: true, path: filePath }
    } catch (err) {
      console.error('Failed to save file:', err)
      return { success: false, error: err.message }
    }
  }
  return { success: false, error: 'Save cancelled' }
})

// Handle the 'load-file' message from the preload script
ipcMain.handle('load-file', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: 'Open Family Tree',
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  })

  if (filePaths && filePaths.length > 0) {
    const filePath = filePaths[0]
    try {
      const fileContent = await fs.readFile(filePath, 'utf8')
      return { success: true, data: JSON.parse(fileContent) }
    } catch (err) {
      console.error('Failed to read file:', err)
      return { success: false, error: err.message }
    }
  }
  return { success: false, error: 'Open cancelled' }
})
