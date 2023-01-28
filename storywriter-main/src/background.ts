'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { IpcUtils } from './logics/utils/ipc-utils'
import { Dialog } from './logics/models/dialogs'
import path from 'path'
import fs from 'fs/promises';
import log from 'electron-log';
import { existsSync } from 'fs';
import { Information } from './logics/models/information'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// Unhandled Error handling 
process.on('uncaughtException', err => {
  log.error('electron:event:uncaughtException');
  log.error(err);
  log.error(err.stack);
  app.quit();
});

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    title: "Storywriter",
    width: 1200,
    height: 720,
    minWidth: 800,
    minHeight: 480,
    titleBarStyle: "hidden",
    fullscreenable: false,
    frame: false,
    webPreferences: {
      
      // Required for Spectron testing
      //enableRemoteModule: !!process.env.IS_TEST,
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await win.loadURL('app://./index.html')
  }

  // Window control events
  IpcUtils.ReceiveOnMain(IpcUtils.DefinedIpcChannels.Minimize, () => {
    win.minimize()
  })
  IpcUtils.ReceiveOnMain(IpcUtils.DefinedIpcChannels.Maximize, () => {
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  IpcUtils.ReceiveOnMain(IpcUtils.DefinedIpcChannels.Close, () => {
    win.close()
  })

  IpcUtils.RelayOnMainAsync(IpcUtils.DefinedIpcChannels.Save, async (_, uri) => {
    return await Dialog.SaveDialog(win, (uri as string)[0]);
  })
  IpcUtils.RelayOnMainAsync(IpcUtils.DefinedIpcChannels.SaveClose, async (_, uri) => {
    return await Dialog.SaveDialog(win, (uri as string)[0]);
  })
  IpcUtils.RelayOnMainAsync(IpcUtils.DefinedIpcChannels.SaveHome, async (_, uri) => {
    return await Dialog.SaveDialog(win, (uri as string)[0]);
  })

  IpcUtils.RelayOnMainAsync(IpcUtils.DefinedIpcChannels.Load, async () => {
    return await Dialog.LoadDialog(win);
  })
  IpcUtils.RelayOnMain(IpcUtils.DefinedIpcChannels.DefaultStoryPath, () => {
    return path.join(path.resolve("."), "default.ysd");
  });

  IpcUtils.RelayOnMainAsync(IpcUtils.DefinedIpcChannels.HomeData, async (_, data) => {
    const settingFile = path.join(path.resolve("."), "home.json");
    const json = data as string;
    if(json.length === 0) {
      // Load
      let jsonFromFile = JSON.stringify(new Information(), null, '\t');
      if(existsSync(settingFile)) {
        jsonFromFile = await fs.readFile(settingFile, 'utf-8');
      }
      return jsonFromFile;
    } else {
      // Save
      await fs.writeFile(settingFile, json, 'utf-8');
      return "";
    }
  })

  // Edit views -> Dialogs
  IpcUtils.RelayOnMain(IpcUtils.DefinedIpcChannels.KernelPanic)
  IpcUtils.RelayOnMain(IpcUtils.DefinedIpcChannels.ModalOpen, (_, flag) => (flag as boolean[])[0]);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e as string)
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
