import { ipcMain, BrowserWindow } from "electron";
import isDev from "electron-is-dev";

import {
  onStateChange,
  getState,
  addSequence,
  selectSequence,
  updateSequence,
  removeSequence,
  addNode,
  selectNode,
  updateNode,
  connectNodes,
  removeNode,
  openSequencesList,
  closeSequencesList,
  editSequence
} from "./state";
import { ISequence, INode, INodeOption } from "../types";

export default function initIpc(window: BrowserWindow) {
  ipcMain.setMaxListeners(100);

  ipcMain.on("getState", event => {
    event.sender.send("stateChange", getState());
  });

  onStateChange(state => {
    window.webContents.send("stateChange", state);
  });

  // UI

  on("openSequencesList", () => {
    openSequencesList();
  });

  on("closeSequencesList", () => {
    closeSequencesList();
  });

  // Sequences

  on("addSequence", () => {
    selectSequence(addSequence());
  });

  on("selectSequence", (sequence: ISequence) => {
    selectSequence(sequence);
  });

  on("editSequence", () => {
    editSequence();
  });

  on("updateSequence", (sequence: ISequence) => {
    updateSequence(sequence);
  });

  on("removeSequence", (sequence: ISequence) => {
    removeSequence(sequence);
  });

  // Nodes

  on("addNode", (fromOption?: INodeOption) => {
    selectNode(addNode(fromOption));
  });

  on("selectNode", (node: INode) => {
    selectNode(node);
  });

  on("connectNodes", (fromNodeOption: INodeOption, toNode: INode) => {
    connectNodes(fromNodeOption, toNode);
  });

  on("updateNode", (node: INode) => {
    updateNode(node);
  });

  on("removeNode", (node: INode, willConfirm: boolean = true) => {
    removeNode(node, willConfirm);
  });
}

function on(eventName: string, handler: (...args: any[]) => void) {
  ipcMain.on(eventName, (event, ...eventArgs) => {
    handler(...eventArgs);
    event.sender.send("stateChange", getState());
  });
}
