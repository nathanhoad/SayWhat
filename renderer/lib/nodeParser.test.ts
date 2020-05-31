import { textToLines, linesToText, textToOptions, optionsToText } from "./nodeParser";
import { INode, INodeLine, INodeOption } from "../../types";
import { v4 as uuid } from "uuid";

describe("Parser", () => {
  it("fails parsing with a line number", () => {
    expect.hasAssertions();

    const lines = `Character: This line is fine.
                  [if  this line is broken`;
    expect(() => {
      textToLines(lines);
    }).toThrow(/Malformed conditional/);

    const options = `This is fine. -> END
                     [if this line is broken`;
    expect(() => {
      textToOptions(options, []);
    }).toThrow(/Malformed conditional/);
  });

  it("can convert text to node lines", () => {
    expect.hasAssertions();

    const text = `[if metLilly=0] Lilly: Hi, I'm Lilly.
                  [if metLilly=1] Lilly: Hello again.

                  [do metLilly=1]

                  Lilly: What can I do for you?`;

    const lines = textToLines(text);
    expect(lines).toHaveLength(6);

    const [if1, if2, blank1, mutation, blank2, plain] = lines;
    expect(if1.condition).toBe("metLilly=0");
    expect(if1.character).toBe("Lilly");
    expect(if1.dialogue).toBe("Hi, I'm Lilly.");

    expect(if2.condition).toBe("metLilly=1");
    expect(if2.character).toBe("Lilly");
    expect(if2.dialogue).toBe("Hello again.");

    expect(blank1.dialogue).toBe("");

    expect(mutation.mutation).toBe("metLilly=1");

    expect(plain.character).toBe("Lilly");
    expect(plain.dialogue).toBe("What can I do for you?");
  });

  it("can convert node lines to text", () => {
    expect.hasAssertions();

    const lines: INodeLine[] = [
      {
        id: uuid(),
        condition: "metLilly=0",
        character: "Lilly",
        dialogue: "Hi, I'm Lilly."
      },
      {
        id: uuid(),
        condition: "metLilly=1",
        character: "Lilly",
        dialogue: "Hello again."
      },
      {
        id: uuid(),
        dialogue: ""
      },
      {
        id: uuid(),
        mutation: "metLilly=1"
      },
      {
        id: uuid(),
        character: "Lilly",
        dialogue: "What can I do for you?"
      }
    ];

    expect(linesToText(null)).toBe("");

    const text = linesToText(lines);

    expect(text).toContain(`[if metLilly=0] Lilly: Hi, I'm Lilly.`);
    expect(text).toContain(`[if metLilly=1] Lilly: Hello again.`);
    expect(text).toContain(`\n\n`);
    expect(text).toContain(`[do metLilly=1]`);
    expect(text).toContain(`Lilly: What can I do for you?`);
  });

  it("can convert text to node options", () => {
    expect.hasAssertions();

    const nodes: INode[] = [
      {
        id: uuid(),
        name: "first",
        updatedAt: null,
        lines: [],
        options: []
      },
      {
        id: uuid(),
        name: "second",
        updatedAt: null,
        lines: [],
        options: []
      }
    ];

    const text = `[if metLilly=0] What's your name? -> first
                  [if metLilly=1] Hi Lilly. -> hello
                  I'm hungry. -> second
                  I don't know. -> unknown

                  Nothing for now.`;

    const options = textToOptions(text, nodes);
    expect(options).toHaveLength(5);

    const [conditional1, conditional2, plain, unknown, ending] = options;
    expect(conditional1.condition).toBe("metLilly=0");
    expect(conditional1.prompt).toBe("What's your name?");
    expect(conditional1.nextNodeId).toBe(nodes[0].id);

    expect(conditional2.condition).toBe("metLilly=1");
    expect(conditional2.prompt).toBe("Hi Lilly.");
    expect(conditional2.nextNodeName).toBe("hello");
    expect(conditional2.nextNodeId).toBeNull();

    expect(plain.prompt).toBe("I'm hungry.");
    expect(plain.nextNodeId).toBe(nodes[1].id);

    expect(unknown.prompt).toBe("I don't know.");
    expect(unknown.nextNodeName).toBe("unknown");
    expect(unknown.nextNodeId).toBeNull();

    expect(ending.prompt).toBe("Nothing for now.");
    expect(ending.nextNodeName).toBe("END");
    expect(ending.nextNodeId).toBeNull();
  });

  it("can convert node options to text", () => {
    expect.hasAssertions();

    const nodes: INode[] = [
      {
        id: uuid(),
        name: "first",
        updatedAt: null,
        lines: [],
        options: []
      },
      {
        id: uuid(),
        name: "second",
        updatedAt: null,
        lines: [],
        options: []
      }
    ];

    const options: INodeOption[] = [
      {
        id: uuid(),
        condition: "metLilly=0",
        prompt: "What's your name?",
        nextNodeId: nodes[0].id
      },
      {
        id: uuid(),
        prompt: "I'm hungry.",
        nextNodeId: nodes[1].id
      },
      {
        id: uuid(),
        prompt: "I don't know.",
        nextNodeName: "unknown"
      },
      {
        id: uuid(),
        prompt: "Nothing for now.",
        nextNodeName: "END",
        nextNodeId: null
      }
    ];

    expect(optionsToText(null, nodes)).toBe("");
    expect(optionsToText([{ id: uuid(), nextNodeName: "END" }], nodes)).toBe("-> END");

    const text = optionsToText(options, nodes);

    expect(text).toContain(`[if metLilly=0] What's your name? -> first`);
    expect(text).toContain(`I'm hungry. -> second`);
    expect(text).toContain(`I don't know. -> unknown`);
    expect(text).toContain(`Nothing for now. -> END`);
  });
});
