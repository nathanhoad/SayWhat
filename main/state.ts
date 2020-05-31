import { app, BrowserWindow, dialog, ipcMain } from "electron";
import isDev from "electron-is-dev";
import EventEmitter from "events";
import { v4 as uuid } from "uuid";
import FS from "fs-extra";

import { getNodesByOptionId } from "../renderer/lib/util";

import { ISequence, INode, INodeOption, IApplicationState, IUserInterfaceState, IProject } from "../types";

const state: IApplicationState = {
  project: getEmptyProject(),
  userInterface: getEmptyUserInterface()
};

const emitter = new EventEmitter();

// General state handling

let window: BrowserWindow;
export default function initState(win: BrowserWindow, filename?: string) {
  window = win;
  if (filename) {
    setFilename(filename);
    setProject(FS.readJsonSync(filename));
    setHasUnsavedChanges(false);
  }
}

export function getState() {
  return state;
}

export function onStateChange(handler: (state: IApplicationState) => void) {
  emitter.on("stateChanged", () => handler(state));
}

export function resetState() {
  state.project = getEmptyProject();
  state.userInterface = getEmptyUserInterface();
  stateChanged();
}

export function setProject(project: IProject) {
  state.project = project;
  stateChanged();
}

function stateChanged() {
  emitter.emit("stateChanged", getState());
}

// UI

export function setFilename(filename: string) {
  state.userInterface.filename = filename;
  stateChanged();
}

export function setLastExportFilename(filename: string) {
  state.userInterface.lastExportFilename = filename;
  stateChanged();
}

export function setHasUnsavedChanges(hasUnsavedChanges: boolean) {
  state.userInterface.hasUnsavedChanges = hasUnsavedChanges;
  stateChanged();
}

export function selectSequence(sequence: ISequence) {
  state.userInterface.selectedSequenceIndex = state.project.sequences.findIndex(s => s.id === sequence.id);
  state.userInterface.selectedNodeIndex = 0;

  stateChanged();
}

export function getSelectedSequence() {
  return state.project.sequences[state.userInterface.selectedSequenceIndex];
}

export function selectNode(node: INode) {
  const sequence = state.project.sequences[state.userInterface.selectedSequenceIndex];
  if (!sequence) return;

  state.userInterface.selectedNodeIndex = sequence.nodes.findIndex(n => n.id === node.id);

  stateChanged();
}

export function getSelectedNode() {
  return getSelectedSequence()?.nodes[state.userInterface.selectedNodeIndex];
}

export function openSequencesList() {
  state.userInterface.isSequencesListOpen = true;
  stateChanged();
}

export function closeSequencesList() {
  state.userInterface.isSequencesListOpen = false;
  stateChanged();
}

// Sequences

export function addSequence() {
  const name = "Untitled sequence #" + Math.floor(Math.random() * 999);

  const newSequence = {
    id: uuid(),
    updatedAt: null,
    name,
    nodes: []
  };
  state.project.sequences.push(newSequence);
  setHasUnsavedChanges(true);
  stateChanged();

  return newSequence;
}

export function editSequence() {
  const promptWindow = new BrowserWindow({
    width: 400,
    height: 170,
    center: true,
    show: false,
    parent: window,
    modal: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  promptWindow.setMenu(null);

  if (isDev) {
    promptWindow.loadURL("http://localhost:8000/edit-sequence");
  } else {
    promptWindow.loadFile(`${app.getAppPath()}/renderer/out/edit-sequence.html`);
  }

  promptWindow.once("ready-to-show", () => promptWindow.show());
}

export function updateSequence(sequence: ISequence) {
  state.project.sequences = state.project.sequences.map(s => {
    if (s.id === sequence.id) return { ...sequence, updatedAt: new Date() };
    return s;
  });
  setHasUnsavedChanges(true);
  stateChanged();
}

export async function removeSequence(sequence: ISequence, willConfirm: boolean = true) {
  if (!sequence) return;

  if (willConfirm) {
    if ((await ask(`Delete ${sequence.name}? This cannot be undone.`, ["Delete sequence", "Cancel"])) === "Cancel")
      return;
  }

  state.project.sequences = state.project.sequences.filter(s => s.id !== sequence.id);

  if (state.userInterface.selectedSequenceIndex >= state.project.sequences.length) {
    state.userInterface.selectedSequenceIndex = Math.max(state.project.sequences.length - 1, 0);
  }
  setHasUnsavedChanges(true);
  stateChanged();
}

// Nodes

export function addNode(fromOption?: INodeOption) {
  const sequence = state.project.sequences[state.userInterface.selectedSequenceIndex];
  if (!sequence) return;

  const nodesByOptionId = getNodesByOptionId(sequence.nodes);

  const id = uuid();
  const name = fromOption?.nextNodeName ?? "Node #" + Math.floor(Math.random() * 9000);

  const newNode: INode = {
    id,
    name,
    lines: [
      {
        id: uuid(),
        character: "Character",
        dialogue: "Hello"
      }
    ],
    options: [
      {
        id: uuid(),
        prompt: "That is all",
        nextNodeName: "END",
        nextNodeId: null
      }
    ],
    updatedAt: null
  };

  // Update the existing node that is creating this new node
  const fromNode: INode = nodesByOptionId[fromOption?.id];
  if (fromNode) {
    fromNode.options = fromNode.options.map(option => {
      if (option.id === fromOption.id) {
        option.nextNodeId = newNode.id || null;
      }
      return option;
    });
  }

  sequence.nodes.push(newNode);
  sequence.updatedAt = new Date();
  setHasUnsavedChanges(true);
  stateChanged();
  return newNode;
}

export function updateNode(node: INode) {
  const sequence = state.project.sequences[state.userInterface.selectedSequenceIndex];
  if (!sequence) return;

  sequence.updatedAt = new Date();
  node.updatedAt = new Date();

  sequence.nodes = sequence.nodes.map(n => (n.id === node.id ? node : n));
  setHasUnsavedChanges(true);
  stateChanged();
}

export function connectNodes(fromNodeOption: INodeOption, toNode: INode) {
  const sequence = state.project.sequences[state.userInterface.selectedSequenceIndex];
  if (!sequence) return;

  if (!fromNodeOption) return;
  if (!toNode) return;

  const nodesByOptionId = getNodesByOptionId(sequence.nodes);
  const fromNode: INode = nodesByOptionId[fromNodeOption.id];

  fromNode.options = fromNode.options.map(option => {
    if (option.id === fromNodeOption.id) {
      option.nextNodeId = toNode.id;
    }
    return option;
  });
  fromNode.updatedAt = new Date();
  sequence.updatedAt = new Date();
  setHasUnsavedChanges(true);
  stateChanged();
}

export async function removeNode(node: INode, willConfirm: boolean = true) {
  const sequence = state.project.sequences[state.userInterface.selectedSequenceIndex];
  if (!sequence) return;

  if (willConfirm) {
    if ((await ask(`Delete ${node.name}? This cannot be undone.`, ["Delete node", "Cancel"])) === "Cancel") return;
  }

  sequence.nodes = sequence.nodes.filter(n => n.id !== node.id);
  sequence.updatedAt = new Date();

  if (state.userInterface.selectedNodeIndex >= sequence.nodes.length) {
    state.userInterface.selectedNodeIndex = Math.max(sequence.nodes.length - 1, 0);
  }
  setHasUnsavedChanges(true);
  stateChanged();
}

/**
 * Show a confirm dialogue
 * @param message
 * @param buttons
 */
export function ask(message: string, buttons: Array<string> = ["OK", "Cancel"]) {
  state.userInterface.confirmDialog = { message, buttons };

  return new Promise((resolve, reject) => {
    const promptWindow = new BrowserWindow({
      width: 400,
      height: 150,
      center: true,
      show: false,
      parent: window,
      modal: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    promptWindow.setMenu(null);

    if (isDev) {
      promptWindow.loadURL("http://localhost:8000/confirm");
    } else {
      promptWindow.loadFile(`${app.getAppPath()}/renderer/out/confirm.html`);
    }

    promptWindow.once("ready-to-show", () => promptWindow.show());

    ipcMain.once("confirm", (event, response) => resolve(response));
  });
}

function getEmptyUserInterface(): IUserInterfaceState {
  return {
    selectedSequenceIndex: 0,
    selectedNodeIndex: 0
  };
}

function getEmptyProject(): IProject {
  const nodeId = uuid();
  return {
    sequences: [
      {
        id: uuid(),
        updatedAt: new Date(),
        name: "Example Sequence",
        nodes: [
          {
            id: nodeId,
            updatedAt: new Date(),
            name: "Start",
            lines: [
              {
                id: uuid(),
                character: "Character",
                dialogue: "Hello!"
              },
              {
                id: uuid(),
                condition: "hasMetCharacter=0",
                character: "Character",
                dialogue: "It's nice to meet you."
              },
              {
                id: uuid(),
                mutation: "hasMetCharacter=1"
              }
            ],
            options: [
              {
                id: uuid(),
                prompt: "Can you repeat that?",
                nextNodeId: nodeId,
                nextNodeName: "Start"
              },
              {
                id: uuid(),
                prompt: "That's all for now",
                nextNodeId: null,
                nextNodeName: "END"
              }
            ]
          }
        ]
      }
    ]
  };
}
