import { v4 as uuid } from "uuid";

import { keyBy } from "./util";
import { INodeLine, INode, INodeResponse } from "../../types";

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
 * @param otherNodes
 */
export function textToLines(text: string, otherNodes: Array<INode>): Array<INodeLine> {
  const byName = keyBy("name", otherNodes);
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

      // Comment
      if (t.startsWith("# ")) {
        line.comment = t.replace("# ", "");
        t = "";
      }

      // Conditional
      if (t.startsWith("[if ")) {
        errorMessage = "Malformed conditional";
        const [match, condition] = t.match(/\[if (.*?)\]/);
        line.condition = condition;
        t = t.replace(match, "").trim();
      }

      // Mutation
      if (t.startsWith("[do ")) {
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
        t = t.replace(match, "").trim();
      }

      if (t.includes("->")) {
        errorMessage = "Malformed redirection";
        const [match, gotoNodeName] = t.match(/\s?->\s?(.*?)$/);
        line.goToNodeName = gotoNodeName === "END" ? "END" : gotoNodeName;
        line.goToNodeId = byName[line.goToNodeName]?.id || null;
        t = t.replace(match, "").trim();
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
export function linesToText(lines: Array<INodeLine>): string {
  if (!lines) return "";

  return lines
    .map(line => {
      if (line.comment) return `# ${line.comment}`;
      if (line.mutation) return `[do ${line.mutation}]`;

      let s = "";
      if (line.condition) s = `[if ${line.condition}] `;
      if (line.dialogue) s += `${line.character}: ${line.dialogue}`;
      if (line.goToNodeName) s += `-> ${line.goToNodeName}`;

      return s;
    })
    .join("\n");
}

/**
 * Convert text into Node responses
 * @param text
 * @param otherNodes
 */
export function textToResponses(text: string, otherNodes: Array<INode>): Array<INodeResponse> {
  const byName = keyBy("name", otherNodes);

  const responses = [];

  text.split("\n").forEach((t, index) => {
    let errorMessage = "";
    try {
      t = t.trim();

      const response: INodeResponse = {
        id: uuid()
      };

      // Ignore blank lines
      if (t === "") return;

      // Conditions
      if (t.includes("[if ")) {
        errorMessage = "Malformed conditional";
        const [match, condition] = t.match(/\[if (.*?)\]/);
        response.condition = condition;
        t = t.replace(match, "").trim();
      }

      // Next node
      if (t.includes("->")) {
        errorMessage = "Malformed redirection";
        const [match, goToNodeName] = t.match(/\s?->\s?(.*?)$/);
        response.goToNodeName = goToNodeName === "END" ? "END" : goToNodeName;
        response.goToNodeId = byName[response.goToNodeName]?.id || null;
        t = t.replace(match, "").trim();
      }
      // End of conversation
      else {
        response.goToNodeId = null;
        response.goToNodeName = "END";
      }

      // Anything left is the prompt
      response.prompt = t;

      responses.push(response);
    } catch (error) {
      throw new ParsingError(errorMessage, index + 1, "responses");
    }
  });

  return responses;
}

/**
 * Convert Node responses to editable text
 * @param responses
 * @param otherNodes
 */
export function responsesToText(responses: Array<INodeResponse>, otherNodes: Array<INode>): string {
  if (!responses) return "";

  const byId = keyBy("id", otherNodes);
  return responses
    .map(response => {
      const name = byId[response.goToNodeId]?.name || response.goToNodeName;

      if (response.condition) return `[if ${response.condition}] ${response.prompt} -> ${name}`;
      if (response.prompt) return `${response.prompt} -> ${name}`;

      return `-> ${name}`;
    })
    .join("\n");
}
