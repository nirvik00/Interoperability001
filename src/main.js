const { app, BrowserWindow, ipcMain, clipboard } = require("electron");
const path = require("path");

if (require("electron-squirrel-startup")) {
    app.quit();
}

var DATA;

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    ipcMain.handle("read-clipboard", () => {
        var data = "";
        data = clipboard.readText();
        if (data.length === 0) {
            data = "info from clipboard";
        }
        // console.log("in main: ", data);
        return data;
    });

    ipcMain.handle("clear-clipboard", () => {
        clipboard.clear();
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(
                __dirname,
                `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
            )
        );
    }

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
