import db from '../datastore'
import { app, BrowserWindow, Menu, ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 635,
    width: 1070,
    useContentSize: true,
    fullscreenable: true, // 是否允许全屏
    resizable: true, // 是否允许拉伸大小
    center: true // 是否出现在屏幕居中的位置
  })
  mainWindow.loadURL(winURL)
  createMenu()
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createMenu(){
    if (process.env.NODE_ENV !== 'development') {
        const template = [{
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
                { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click () {
                        app.quit()
                    }
                },
                { type: 'separator' },
                { label: 'Debug', accelerator: 'F12', click(){
                    if(mainWindow){
                        mainWindow.openDevTools();
                    }
                }
                },
            ]
        }]
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }
}

// 当electron完成初始化后触发
app.on('ready', createWindow)

// 所有窗口都关闭的时候触发
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

/**
 * ipc 事件
 * */
