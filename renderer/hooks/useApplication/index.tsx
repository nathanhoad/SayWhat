import { ipcRenderer } from "electron";
import { createContext, useContext, useEffect, useState } from "react";

import { NodePickerProvider } from "../useNodePicker";

import { IProject, ISequence, INode, IApplicationState, IUserInterfaceState } from "../../../types";
import { NodesProvider } from "../useNodes";

interface IApplicationContext {
  project: IProject;

  userInterface: IUserInterfaceState;
  respondToConfirmDialog: (response: string) => void;
  openSequencesList: () => void;
  closeSequencesList: () => void;
  selectSequence: (sequence: ISequence) => void;
  selectedSequence: ISequence;
  selectNode: (node: INode) => void;
  selectedNode: INode;

  addSequence: () => void;
  editSequence: () => void;
  updateSequence: (sequence: ISequence) => void;
  removeSequence: (sequence: ISequence) => void;

  addNode: (name?: string, fromId?: string) => void;
  updateNode: (node: INode) => void;
  connectNodes: (fromId: string, toNodeId: string) => void;
  removeNode: (node: INode, willConfirm?: boolean) => void;
}

const ApplicationContext = createContext<IApplicationContext>(null);

export function ApplicationProvider({ children }: { children: any }) {
  const [project, setProject] = useState<IProject>(null);
  const [userInterface, setUserInterface] = useState<IUserInterfaceState>({
    hasUnsavedChanges: false,
    filename: null,
    lastExportFilename: null,
    isSequencesListOpen: false,
    selectedNodeIndex: 0,
    selectedSequenceIndex: 0
  });

  const [selectedSequence, setSelectedSequence] = useState<ISequence>(null);
  const [selectedNode, setSelectedNode] = useState<INode>(null);

  useEffect(() => {
    function onStateChange(event: Event, state: IApplicationState) {
      setProject(state.project);
      setUserInterface(state.userInterface);

      const sequence = state.project.sequences[state.userInterface.selectedSequenceIndex];
      setSelectedSequence(sequence);
      setSelectedNode(sequence ? sequence.nodes[state.userInterface.selectedNodeIndex] : null);
    }

    ipcRenderer.on("stateChange", onStateChange);
    ipcRenderer.send("getState");

    return () => {
      ipcRenderer.off("stateChange", onStateChange);
    };
  }, []);

  // UI

  function respondToConfirmDialog(response: string) {
    ipcRenderer.send("confirm", response);
  }

  function selectSequence(sequence: ISequence) {
    ipcRenderer.send("selectSequence", sequence);
  }

  function selectNode(node: INode) {
    ipcRenderer.send("selectNode", node);
  }

  function openSequencesList() {
    ipcRenderer.send("openSequencesList");
  }

  function closeSequencesList() {
    ipcRenderer.send("closeSequencesList");
  }

  // Sequences

  function addSequence() {
    ipcRenderer.send("addSequence");
  }

  function updateSequence(sequence: ISequence) {
    ipcRenderer.send("updateSequence", sequence);
  }

  function editSequence() {
    ipcRenderer.send("editSequence");
  }

  function removeSequence(sequence: ISequence) {
    ipcRenderer.send("removeSequence", sequence);
  }

  // Nodes

  function addNode(name?: string, fromId?: string) {
    ipcRenderer.send("addNode", name, fromId);
  }

  function updateNode(node: INode) {
    ipcRenderer.send("updateNode", node);
  }

  function connectNodes(fromId: string, toNodeId: string) {
    ipcRenderer.send("connectNodes", fromId, toNodeId);
  }

  function removeNode(node: INode, willConfirm: boolean = true) {
    ipcRenderer.send("removeNode", node, willConfirm);
  }

  if (!project) return <div />;

  return (
    <ApplicationContext.Provider
      value={{
        project,

        userInterface,
        respondToConfirmDialog,
        openSequencesList,
        closeSequencesList,
        selectSequence,
        selectedSequence,
        selectNode,
        selectedNode,

        addSequence,
        editSequence,
        updateSequence,
        removeSequence,

        addNode,
        updateNode,
        connectNodes,
        removeNode
      }}>
      <NodesProvider>
        <NodePickerProvider>{children}</NodePickerProvider>
      </NodesProvider>
    </ApplicationContext.Provider>
  );
}

export default function useApplication() {
  return useContext(ApplicationContext);
}
