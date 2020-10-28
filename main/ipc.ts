import { ipcMain, BrowserWindow } from "electron";

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
import { ISequence, INode, INodeResponse } from "../types";

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

  on("addNode", (name: string, fromId?: string) => {
    selectNode(addNode(name, fromId));
  });

  on("selectNode", (node: INode) => {
    selectNode(node);
  });

  on("connectNodes", (fromId: string, toNodeId: string) => {
    connectNodes(fromId, toNodeId);
  });

  on("updateNode", (node: INode) => {
    updateNode(node);
  });

  on("removeNode", (node: INode, willConfirm: boolean = true) => {
    removeNode(node, willConfirm);
  });
}

function on(eventName: string, handler: (...args: Array<any>) => void) {
  ipcMain.on(eventName, (event, ...eventArgs) => {
    handler(...eventArgs);
    event.sender.send("stateChange", getState());
  });
}
