const { ipcRenderer } = require("electron")

ipcRenderer.on("shortcutKey", (e, key) => {
    switch (key) {
        case "ESC": {
            document.exitPointerLock();
        }
    }
});