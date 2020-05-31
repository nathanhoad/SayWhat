import { v4 as uuid } from "uuid";

import { keyBy } from "./util";
import { INodeLine, INode, INodeOption } from "../../types";

class ParsingError extends Error {
  public line: number;
  public type: string;

  constructor(message: string, line: number, type: string) {
    super(message);
    this.line = line;
    this.type = type;
  }
}

/**
 * Parse text into Node lines
 * @param text
 */
export function textToLines(text: string): INodeLine[] {
  const lines = [];

  text.split("\n").forEach((t, index) => {
    let errorMessage = "";
    try {
      t = t.trim();

      const line: INodeLine = {
        id: uuid()
      };

      if (t === "") {
        line.dialogue = "";
      }

      // Conditional
      if (t.includes("[if ")) {
        errorMessage = "Malformed conditional";
        const [match, condition] = t.match(/\[if (.*?)\]/);
        line.condition = condition;
        t = t.replace(match, "").trim();
      }

      // Mutation
      if (t.includes("[do ")) {
        errorMessage = "Malformed mutation";
        const [match, mutation] = t.match(/\[do (.*?)\]/);
        line.mutation = mutation;
        t = t.replace(match, "").trim();
      }

      if (t.includes(":")) {
        errorMessage = "Malformed dialogue";
        const [match, character, dialogue] = t.match(/(.*?):\s?(.*?)$/);
        line.character = character;
        line.dialogue = dialogue;
        t = t.replace(match, "");
      }

      lines.push(line);
    } catch (error) {
      throw new ParsingError(errorMessage, index + 1, "lines");
    }
  });

  return lines;
}

/**
 * Convert lines into editable text
 * @param lines
 */
export function linesToText(lines: INodeLine[]): string {
  if (!lines) return "";

  return lines
    .map(line => {
      if (line.mutation) return `[do ${line.mutation}]`;
      if (line.condition) return `[if ${line.condition}] ${line.character}: ${line.dialogue}`;

      if (line.dialogue === "") return "";

      return `${line.character}: ${line.dialogue}`;
    })
    .join("\n");
}

/**
 * Convert text into Node options
 * @param text
 * @param otherNodes
 */
export function textToOptions(text: string, otherNodes: INode[]): INodeOption[] {
  const byName = keyBy("name", otherNodes);

  const options = [];

  text.split("\n").forEach((t, index) => {
    let errorMessage = "";
    try {
      t = t.trim();

      const option: INodeOption = {
        id: uuid()
      };

      // Ignore blank lines
      if (t === "") return;

      // Conditions
      if (t.includes("[if ")) {
        errorMessage = "Malformed conditional";
        const [match, condition] = t.match(/\[if (.*?)\]/);
        option.condition = condition;
        t = t.replace(match, "").trim();
      }

      // Next node
      if (t.includes("->")) {
        errorMessage = "Malformed mutation";
        const [match, nextNodeName] = t.match(/\s?->\s?(.*?)$/);
        option.nextNodeName = nextNodeName === "END" ? "END" : nextNodeName;
        option.nextNodeId = byName[option.nextNodeName]?.id || null;
        t = t.replace(match, "").trim();
      }
      // End of conversation
      else {
        option.nextNodeId = null;
        option.nextNodeName = "END";
      }

      // Anything left is the prompt
      option.prompt = t;

      options.push(option);
    } catch (error) {
      throw new ParsingError(errorMessage, index + 1, "options");
    }
  });

  return options;
}

/**
 * Convert Node options to editable text
 * @param options
 * @param otherNodes
 */
export function optionsToText(options: INodeOption[], otherNodes: INode[]): string {
  if (!options) return "";

  const byId = keyBy("id", otherNodes);
  return options
    .map(option => {
      const name = byId[option.nextNodeId]?.name || option.nextNodeName;

      if (option.condition) return `[if ${option.condition}] ${option.prompt} -> ${name}`;
      if (option.prompt) return `${option.prompt} -> ${name}`;

      return `-> ${name}`;
    })
    .join("\n");
}
