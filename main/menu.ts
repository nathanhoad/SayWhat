import Path from "path";
import { app, Menu, BrowserWindow } from "electron";
import isDev from "electron-is-dev";

import {
  onStateChange,
  openSequencesList,
  addSequence,
  removeSequence,
  getSelectedSequence,
  addNode,
  selectSequence,
  selectNode,
  closeSequencesList,
  editSequence
} from "./state";
import {
  newProject,
  openProject,
  saveProject,
  repeatLastExport,
  exportProjectAsXml,
  exportProjectAsJson,
  promptToSaveIfNeededWasCancelled
} from "./file";

export default function initMenu(window: BrowserWindow) {
  const isMac = process.platform === "darwin";

  const menu = Menu.buildFromTemplate([
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const }
            ]
          }
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "New Project",
          accelerator: "CommandOrControl+Shift+N",
          click() {
            newProject();
          }
        },
        {
          label: "Open Project...",
          accelerator: "CommandOrControl+O",
          click() {
            openProject();
          }
        },
        {
          type: "separator"
        },
        {
          label: "Save Project",
          accelerator: "CommandOrControl+S",
          click() {
            saveProject();
          }
        },
        {
          label: "Save Project As...",
          accelerator: "CommandOrControl+Shift+S",
          click() {
            saveProject(true);
          }
        },
        ...(isMac ? [] : [{ type: "separator" as const }, { role: "quit" as const }])
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" }
      ]
    },
    {
      id: "sequences",
      label: "Sequences",
      submenu: [
        {
          label: "Show Sequences...",
          accelerator: "CommandOrControl+L",
          click() {
            openSequencesList();
          }
        },
        {
          type: "separator"
        },
        {
          label: "Add Sequence",
          click() {
            selectSequence(addSequence());
            closeSequencesList();
          }
        },
        {
          id: "editSequence",
          label: "Edit Sequence...",
          click() {
            editSequence();
          }
        },
        {
          id: "removeSequence",
          label: "Remove Sequence...",
          click() {
            removeSequence(getSelectedSequence());
          }
        },
        {
          type: "separator"
        },
        {
          id: "addNode",
          label: "Add Node",
          accelerator: "CommandOrControl+N",
          click() {
            selectNode(addNode());
          }
        }
      ]
    },
    {
      id: "export",
      label: "Export",
      submenu: [
        {
          label: "As XML + Resx...",
          click() {
            exportProjectAsXml();
          }
        },
        {
          label: "As JSON...",
          click() {
            exportProjectAsJson();
          }
        },
        {
          type: "separator"
        },
        {
          id: "repeatLastExport",
          label: "Repeat Last Export",
          accelerator: "CommandOrControl+Shift+E",
          enabled: false,
          click() {
            repeatLastExport();
          }
        }
      ]
    },
    ...(isDev
      ? [
          {
            label: "Debug",
            submenu: [
              {
                label: "Show Dev Tools...",
                accelerator: "CmdOrCtrl+Alt+I",
                click() {
                  window.webContents.toggleDevTools();
                }
              }
            ]
          }
        ]
      : [])
  ]);

  let willConfirmClose = true;
  window.on("close", async event => {
    if (willConfirmClose) event.preventDefault();

    if (await promptToSaveIfNeededWasCancelled()) return;

    willConfirmClose = false;
    app.quit();
  });

  Menu.setApplicationMenu(menu);

  onStateChange(state => {
    const hasSequences = state.project.sequences.length > 0;
    const sequencesMenu = menu.getMenuItemById("sequences").submenu;
    sequencesMenu.getMenuItemById("editSequence").enabled = hasSequences;
    sequencesMenu.getMenuItemById("removeSequence").enabled = hasSequences;
    sequencesMenu.getMenuItemById("addNode").enabled = hasSequences;

    const exportMenu = menu.getMenuItemById("export").submenu;
    if (state.userInterface.lastExportFilename) {
      exportMenu.getMenuItemById("repeatLastExport").enabled = true;
    }
  });
}
