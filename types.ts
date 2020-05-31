export interface IApplicationState {
  project: IProject;
  userInterface: IUserInterfaceState;
}

export interface IUserInterfaceState {
  confirmDialog?: IConfirmDialog;
  hasUnsavedChanges?: boolean;
  filename?: string;
  lastExportFilename?: string;
  isSequencesListOpen?: boolean;
  selectedSequenceIndex: number;
  selectedNodeIndex: number;
}

export interface IConfirmDialog {
  message?: string;
  buttons?: Array<string>;
  response?: number;
}

export interface IProject {
  sequences: Array<ISequence>;
}

export interface ISequence {
  id: string;
  name: string;
  nodes: Array<INode>;
  updatedAt: Date;
}

export interface INode {
  id: string;
  name: string;
  lines: Array<INodeLine>;
  options: Array<INodeOption>;
  updatedAt: Date;
}

export interface INodeLine {
  id: string;
  condition?: string;
  character?: string;
  dialogue?: string;
  mutation?: string;
}

export interface INodeOption {
  id: string;
  condition?: string;
  prompt?: string;
  nextNodeName?: string;
  nextNodeId?: string;
}
