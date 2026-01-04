require("v8-compile-cache");

const { app, ipcMain, Menu, protocol, BrowserWindow, dialog, } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const localShortcut = require("electron-localshortcut");
const log = require("electron-log");
const store = require("electron-store");
const fs = require("fs");

//使用するウィンドウの作成
let splashWindow, gameWindow
let appVersion = app.getVersion()

// DevMode
autoUpdater.forceDevUpdateConfig = true;

//スプラッシュウィンドウの作成
const createSplash = () => {
    splashWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 450,
        frame: false,
        icon: path.join(__dirname, "./src/img/icon.ico"),
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, './src/js/splash-preload.js')
        }
    })
    //スプラッシュの表示
    splashWindow.loadFile(path.join(__dirname, './src/html/splash.html'))
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
const createGame = () => {
    gameWindow = new BrowserWindow({
        height: 800,
        show: false,
        width: 1000,
        icon: path.join(__dirname, "./src/img/icon.ico"),
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, "./src/js/game-preload.js")
        }
    })
    gameWindow.loadURL("https://kirka.io/")
    // ショートカットキーの設定
    localShortcut.register(gameWindow, "F5", () => {
        gameWindow.reload();
    });
    localShortcut.register(gameWindow, "Esc", () => {
        gameWindow.webContents.send("shortcutKey", "ESC");
    });
    localShortcut.register(gameWindow, "F11", () => {
        const isFullScreen = gameWindow.isFullScreen();
        gameWindow.setFullScreen(!isFullScreen);
    });
    gameWindow.setTitle("DEKAMARA CLIENT");
    gameWindow.on("page-title-updated", (e) => {
        e.preventDefault();
    }); gameWindow.on("ready-to-show", () => {
        splashWindow.destroy()
        gameWindow.show()
    })

    Menu.setApplicationMenu(null);
};
app.commandLine.appendSwitch("disable-frame-rate-limit")
app.commandLine.appendSwitch("disable-breakpad");
app.commandLine.appendSwitch("disable-print-preview");
app.commandLine.appendSwitch("disable-metrics-repo");
app.commandLine.appendSwitch("disable-metrics");
app.commandLine.appendSwitch("disable-2d-canvas-clip-aa");
app.commandLine.appendSwitch("disable-bundled-ppapi-flash");
app.commandLine.appendSwitch("disable-logging");
app.commandLine.appendSwitch("disable-hang-monitor");
app.commandLine.appendSwitch("disable-component-update");
app.commandLine.appendSwitch("enable-javascript-harmony");
app.commandLine.appendSwitch("enable-future-v8-vm-features");
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("enable-highres-timer");
app.commandLine.appendSwitch("enable-quic");
app.commandLine.appendSwitch("renderer-process-limit", "100");
app.commandLine.appendSwitch("max-active-webgl-contexts", "100");
app.commandLine.appendSwitch("webrtc-max-cpu-consumption-percentage", "100",);
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-oop-rasterization");
app.commandLine.appendSwitch("disable-zero-copy");
app.commandLine.appendSwitch("disable-low-end-device-mode");
app.commandLine.appendSwitch("enable-accelerated-video-decode");
app.commandLine.appendSwitch("enable-native-gpu-memory-buffers");
app.commandLine.appendSwitch("high-dpi-support", "1");
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("no-pings");
app.commandLine.appendSwitch("no-proxy-server");

app.on('ready', () => {
    createSplash();
});