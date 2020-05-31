import { app, BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import initNext from "electron-next";

import initIpc from "./ipc";
import initMenu from "./menu";
import initState from "./state";

app.name = "SayWhat";
app.allowRendererProcessReuse = true;

// Boot up Next
initNext("./renderer");

app.on("ready", () => {
  let openedFile: string;

  // See if we've been opened by clicking on a file
  if (process.platform === "darwin") {
    app.on("open-file", (event, requestedFile) => {
      event.preventDefault();
      openedFile = requestedFile;
    });
  } else {
    openedFile = process.argv[1];
  }

  const window = new BrowserWindow({
    width: 1100,
    minWidth: 1100,
    height: 600,
    minHeight: 600,
    resizable: true,
    show: false,
    acceptFirstMouse: true,
    webPreferences: {
      nodeIntegration: true,
      devTools: true // isDev
    }
  });

  initIpc(window);
  initMenu(window);
  initState(window, openedFile);

  if (isDev) {
    setTimeout(() => {
      window.loadURL("http://localhost:8000");
    }, 4000);
  } else {
    window.loadFile(`${app.getAppPath()}/renderer/out/index.html`);
  }

  window.once("ready-to-show", () => {
    window.show();
    window.maximize();
  });

  window.on("closed", app.quit);
});
