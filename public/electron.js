// Module to control the application lifecycle and the native browser window.
const { app, shell, BrowserWindow, protocol } = require("electron");
const path = require("path");
const url = require("url");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: '../src/assets/TMT_Logo.png',
        // Set the path of an additional "preload" script that can be used to
        // communicate between node-land and browser-land.
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation:false,
            nodeIntegrationInWorker: true, // <---  for web workers
            enableRemoteModule: true
        },
    });
    
    // In production, set the initial browser path to the local bundle generated
    // by the Create React App build process.
    // In development, set it to localhost to allow live/hot-reloading.
    const appURL = app.isPackaged
        ? url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true,
            })
        : "http://localhost:3000";
    mainWindow.loadURL(appURL);

    // Adds ability to open external websites in new windows
    mainWindow.webContents.on("new-window", function(event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });

    // Automatically open Chrome's DevTools in development mode.
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }
}


// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizerProxy() {
    protocol.registerHttpProtocol(
        "file",
        (request, callback) => {
        const url = request.url.substr(8);
        callback({ path: path.normalize(`${__dirname}/${url}`) });
        },
        (error) => {
        if (error) console.error("Failed to register protocol");
        }
    );
}
  
// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();
    setupLocalFilesNormalizerProxy();
  
    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
      app.quit();
    }
});
  
// If your app has no need to navigate or only needs to navigate to known pages
const allowedNavigationDestinations = "https://my-electron-app.com";
    app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
        event.preventDefault();
        }
    });
});


require('@electron/remote/main').initialize()