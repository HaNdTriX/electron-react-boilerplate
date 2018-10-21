const { app, BrowserWindow } = require('electron')
const electronWindowState = require('electron-window-state')
const { join } = require('path')
const { format } = require('url')

// Disable security warnings (only if you have see it at least once!)
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow () {
  // Load the previous state with fallback to defaults
  let windowState = electronWindowState({
    defaultWidth: 1000,
    defaultHeight: 800
  })

  // Create the window using the state information
  const window = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      webSecurity: false
    }
  })

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  windowState.manage(window)

  // Open devtools in development
  if (!app.isPackaged) {
    window.webContents.openDevTools()
    window.webContents.on('devtools-opened', () => {
      window.focus()
      setImmediate(() => window.focus())
    })
  }

  const startUrl = process.env.ELECTRON_START_URL || format({
    pathname: join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true
  })

  window.loadURL(startUrl)

  window.on('closed', () => {
    mainWindow = null
  })

  return window
}

// Quit application when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// Create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
