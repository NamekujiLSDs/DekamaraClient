//ライブラリの読みこみ
const { BrowserView, BrowserWindow, app, ipcMain } = require('electron');
const { Store } = require('electron-store');
const log = require('electron-log');
const shortcut = require('electron-localshortcut');
const fs = require('fs');
const path = require('path');

//使用するウィンドウの作成
let splashWindow, gameWindow
let appVersion = app.getVersion()

//スプラッシュウィンドウの作成
const createSplash = () => {
    splashWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 450,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, './assets/js/splash-preload.js')
        }
    })
    //スプラッシュの表示
    splashWindow.loadFile(path.join(__dirname, './assets/html/splash.html'))
    // splashWindow.toggleDevTools()
    //自動アップデート機能はここから
    const update = async () => {
        let updateCheck = null
        autoUpdater.on('checking-for-update', () => {
            splashWindow.webContents.send('status', 'Checking for updates...')
            updateCheck = setTimeout(() => {
                splashWindow.webContents.send('status', 'Update check error!')
                setTimeout(() => {
                    createGame()
                }, 1000)
            }, 15000)
        })
        autoUpdater.on('update-available', i => {
            if (updateCheck) clearTimeout(updateCheck)
            splashWindow.webContents.send(
                'status',
                `Found new version v${i.version}!`
            )
        })
        autoUpdater.on('update-not-available', () => {
            if (updateCheck) clearTimeout(updateCheck)
            splashWindow.webContents.send(
                'status',
                'You are using the latest version!'
            )
            setTimeout(() => {
                createGame()
            }, 1000)
        })
        autoUpdater.on('error', e => {
            if (updateCheck) clearTimeout(updateCheck)
            splashWindow.webContents.send('status', 'Error!' + e.name)
            setTimeout(() => {
                createGame()
            }, 1000)
        })
        autoUpdater.on('download-progress', i => {
            if (updateCheck) clearTimeout(updateCheck)
            splashWindow.webContents.send('status', 'Downloading new version...')
        })
        autoUpdater.on('update-downloaded', i => {
            if (updateCheck) clearTimeout(updateCheck)
            splashWindow.webContents.send('status', 'Update downloaded')
            setTimeout(() => {
                autoUpdater.quitAndInstall()
            }, 1000)
        })
        autoUpdater.autoDownload = 'download'
        autoUpdater.allowPrerelease = false
        autoUpdater.checkForUpdates()
    }
    //アップデーターが動くよ
    splashWindow.webContents.on('did-finish-load', () => {
        splashWindow.webContents.send('ver', appVersion)
        splashWindow.show()
        update()
    })
}


app.on('ready', () => {
    createSplash();
});