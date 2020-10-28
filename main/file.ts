import { dialog, shell } from "electron";
import Path from "path";
import FS from "fs-extra";

import {
  getState,
  resetState,
  setProject,
  setFilename,
  setHasUnsavedChanges,
  setLastExportFilename,
  ask
} from "./state";
import { projectToTres, projectToXml, projectToJson, projectToResx } from "./export";

/**
 * Get the current version of SayWhat
 */
export function getVersion(): number {
  const pkg = FS.readJsonSync(Path.join(__dirname, "..", "..", "..", "package.json"));
  if (pkg) {
    const [major, minor] = pkg.version.split(".");
    return parseFloat(`${major}.${minor}`);
  }
  return 1;
}

/**
 * Reset the project back to the default state
 */
export async function newProject() {
  if (await promptToSaveIfNeededWasCancelled()) return;

  resetState();
}

/**
 * Open a project
 */
export async function openProject() {
  if (await promptToSaveIfNeededWasCancelled()) return;

  let filename = null;
  const filenames = dialog.showOpenDialogSync({
    title: "Open a project",
    properties: ["openFile", "createDirectory"],
    buttonLabel: "Open project",
    filters: [{ name: "SayWhat projects (*.saywhat)", extensions: ["saywhat"] }]
  });

  if (filenames && filenames.length > 0) {
    filename = filenames[0];
    FS.mkdirpSync(Path.dirname(filename));

    setFilename(filename);
    setProject(FS.readJsonSync(filename));
    setHasUnsavedChanges(false);
  }
}

/**
 * Save the current project to file
 * @param saveAs
 */
export function saveProject(saveAs: boolean = false) {
  const { userInterface, project } = getState();

  let filename = userInterface.filename;

  // Don't have to do anything if there are no changes
  // and we aren't forcing a save
  if (filename && !userInterface.hasUnsavedChanges && !saveAs) return;

  // Ask for a filename
  if (!filename || saveAs) {
    const path = dialog.showSaveDialogSync({
      title: "Save project",
      buttonLabel: "Save project",
      filters: [{ name: "SayWhat projects (*.saywhat)", extensions: ["saywhat"] }]
    });

    if (path) {
      filename = path + (Path.extname(path) !== ".saywhat" ? ".saywhat" : "");
    } else {
      // Cancel
      return;
    }
  }

  project.savedWithVersion = getVersion();

  FS.mkdirpSync(Path.dirname(filename));
  FS.writeJsonSync(filename, project);

  setFilename(filename);
  setHasUnsavedChanges(false);
}

/**
 * Repeat the last export in this session
 */
export function repeatLastExport() {
  const { userInterface } = getState();

  if (!userInterface.lastExportFilename) return exportProjectAsXml();

  const filename = userInterface.lastExportFilename;
  FS.mkdirpSync(Path.dirname(filename));

  if (userInterface.lastExportFilename.endsWith(".xml")) {
    FS.writeFileSync(filename, projectToXml(getState().project));
  } else {
    FS.writeFileSync(filename, projectToJson(getState().project));
  }

  shell.showItemInFolder(filename);
}

/**
 * Export the project as a Godot Resource
 */
export function exportProjectAsTres() {
  const path = dialog.showSaveDialogSync({
    title: "Save project",
    buttonLabel: "Save project",
    filters: [{ name: "Godot Resource files (*.tres)", extensions: ["tres"] }]
  });

  if (path) {
    const filename = path + (Path.extname(path) !== ".tres" ? ".tres" : "");
    FS.mkdirpSync(Path.dirname(filename));
    FS.writeFileSync(filename, projectToTres(getState().project));
    setLastExportFilename(filename);
    shell.showItemInFolder(filename);
  }
}

/**
 * Export the project to XML
 */
export function exportProjectAsXml() {
  const path = dialog.showSaveDialogSync({
    title: "Save project",
    buttonLabel: "Save project",
    filters: [{ name: "XML files (*.xml)", extensions: ["xml"] }]
  });

  if (path) {
    const filename = path + (Path.extname(path) !== ".xml" ? ".xml" : "");
    FS.mkdirpSync(Path.dirname(filename));
    FS.writeFileSync(filename, projectToXml(getState().project));
    setLastExportFilename(filename);
    shell.showItemInFolder(filename);

    const resXFilename = filename.replace(".xml", ".resx");
    FS.mkdirpSync(Path.dirname(resXFilename));
    FS.writeFileSync(resXFilename, projectToResx(getState().project));
  }
}

/**
 * Export the project as JSON
 */
export function exportProjectAsJson() {
  const path = dialog.showSaveDialogSync({
    title: "Save project",
    buttonLabel: "Save project",
    filters: [{ name: "JSON files (*.json)", extensions: ["json"] }]
  });

  if (path) {
    const filename = path + (Path.extname(path) !== ".json" ? ".json" : "");
    FS.mkdirpSync(Path.dirname(filename));
    FS.writeFileSync(filename, projectToJson(getState().project));
    setLastExportFilename(filename);
    shell.showItemInFolder(filename);
  }
}

/**
 * Ask to save the current project if it needs it
 */
export async function promptToSaveIfNeededWasCancelled() {
  if (!getState().userInterface.hasUnsavedChanges) return false;

  const response = await ask("Do you want to save this project first?", ["Save project", "Discard changes", "Cancel"]);

  // Cancel
  if (response === "Cancel") return true;

  // Save
  if (response === "Save project") saveProject();

  return false;
}
