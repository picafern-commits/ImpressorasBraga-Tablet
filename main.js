const { app, BrowserWindow, shell, session } = require("electron");
const path = require("path");

app.commandLine.appendSwitch("disable-http-cache");

let win;

const APP_REMOTE_URL = "https://picafern-commits.github.io/App-Tablet/";

async function createWindow() {

  try {

    const ses = session.defaultSession;

    // LIMPA APENAS CACHE HTTP
    await ses.clearCache();

    // NÃO APAGAR STORAGE DO FIREBASE
    // await ses.clearStorageData();

  } catch (e) {

    console.log("Erro cache:", e);

  }

  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    autoHideMenuBar: true,
    backgroundColor: "#0f172a",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  });

  // ABRIR APP ONLINE
  await win.loadURL(
    APP_REMOTE_URL + "?desktop=" + Date.now()
  );

  // LINKS EXTERNOS
  win.webContents.setWindowOpenHandler(({ url }) => {

    shell.openExternal(url);

    return { action: "deny" };

  });

}

// START
app.whenReady().then(() => {

  createWindow();

});

// FECHAR
app.on("window-all-closed", () => {

  if (process.platform !== "darwin") {

    app.quit();

  }

});

// MACOS
app.on("activate", () => {

  if (BrowserWindow.getAllWindows().length === 0) {

    createWindow();

  }

});
