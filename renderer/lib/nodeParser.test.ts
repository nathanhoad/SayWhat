import { textToLines, linesToText, textToResponses, responsesToText } from "./nodeParser";
import { INode, INodeLine, INodeResponse } from "../../types";
import { v4 as uuid } from "uuid";

describe("Parser", () => {
  it("fails parsing with a line number", () => {
    expect.hasAssertions();

    const lines = `Character: This line is fine.
                  [if  this line is broken`;
    expect(() => {
      textToLines(lines, []);
    }).toThrow(/Malformed conditional/);

    const responses = `This is fine. -> END
                     [if this line is broken`;
    expect(() => {
      textToResponses(responses, []);
    }).toThrow(/Malformed conditional/);
  });

  it("can convert text to node lines", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: uuid(),
        name: "Something",
        updatedAt: null,
        lines: [],
        responses: []
      }
    ];

    const text = `[if metLilly=0] Lilly: Hi, I'm Lilly.
                  [if metLilly=1] Lilly: Hello again.

                  [do metLilly=1]

                  Lilly: What can I do for you?
                  
                  # Comment line
                  [if something] -> Something
                  [if something] -> Unknown
                  -> END`;

    const lines = textToLines(text, nodes);
    expect(lines).toHaveLength(11);

    const [if1, if2, blank1, mutation, blank2, plain, blank3, comment, goto, gotoBad, gotoEnd] = lines;
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

    expect(comment.comment).toBe("Comment line");

    expect(goto.goToNodeName).toBe("Something");
    expect(goto.goToNodeId).toBe(nodes[0].id);

    expect(gotoBad.goToNodeId).toBeNull();

    expect(gotoEnd.goToNodeId).toBeNull();
    expect(gotoEnd.goToNodeName).toBe("END");
  });

  it("can convert node lines to text", () => {
    expect.hasAssertions();

    const lines: Array<INodeLine> = [
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
      },
      {
        id: uuid(),
        comment: "Comment line"
      },
      {
        id: uuid(),
        condition: "something",
        goToNodeId: uuid(),
        goToNodeName: "Something"
      }
    ];

    expect(linesToText(null)).toBe("");

    const text = linesToText(lines);

    expect(text).toContain(`[if metLilly=0] Lilly: Hi, I'm Lilly.`);
    expect(text).toContain(`[if metLilly=1] Lilly: Hello again.`);
    expect(text).toContain(`\n\n`);
    expect(text).toContain(`[do metLilly=1]`);
    expect(text).toContain(`Lilly: What can I do for you?`);
    expect(text).toContain("# Comment line");
    expect(text).toContain(`[if something] -> Something`);
  });

  it("can convert text to node responses", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: uuid(),
        name: "first",
        updatedAt: null,
        lines: [],
        responses: []
      },
      {
        id: uuid(),
        name: "second",
        updatedAt: null,
        lines: [],
        responses: []
      }
    ];

    const text = `[if metLilly=0] What's your name? -> first
                  [if metLilly=1] Hi Lilly. -> hello
                  I'm hungry. -> second
                  I don't know. -> unknown

                  Nothing for now.`;

    const responses = textToResponses(text, nodes);
    expect(responses).toHaveLength(5);

    const [conditional1, conditional2, plain, unknown, ending] = responses;
    expect(conditional1.condition).toBe("metLilly=0");
    expect(conditional1.prompt).toBe("What's your name?");
    expect(conditional1.goToNodeId).toBe(nodes[0].id);

    expect(conditional2.condition).toBe("metLilly=1");
    expect(conditional2.prompt).toBe("Hi Lilly.");
    expect(conditional2.goToNodeName).toBe("hello");
    expect(conditional2.goToNodeId).toBeNull();

    expect(plain.prompt).toBe("I'm hungry.");
    expect(plain.goToNodeId).toBe(nodes[1].id);

    expect(unknown.prompt).toBe("I don't know.");
    expect(unknown.goToNodeName).toBe("unknown");
    expect(unknown.goToNodeId).toBeNull();

    expect(ending.prompt).toBe("Nothing for now.");
    expect(ending.goToNodeName).toBe("END");
    expect(ending.goToNodeId).toBeNull();
  });

  it("can convert node responses to text", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: uuid(),
        name: "first",
        updatedAt: null,
        lines: [],
        responses: []
      },
      {
        id: uuid(),
        name: "second",
        updatedAt: null,
        lines: [],
        responses: []
      }
    ];

    const responses: Array<INodeResponse> = [
      {
        id: uuid(),
        condition: "metLilly=0",
        prompt: "What's your name?",
        goToNodeId: nodes[0].id
      },
      {
        id: uuid(),
        prompt: "I'm hungry.",
        goToNodeId: nodes[1].id
      },
      {
        id: uuid(),
        prompt: "I don't know.",
        goToNodeName: "unknown"
      },
      {
        id: uuid(),
        prompt: "Nothing for now.",
        goToNodeName: "END",
        goToNodeId: null
      }
    ];

    expect(responsesToText(null, nodes)).toBe("");
    expect(responsesToText([{ id: uuid(), goToNodeName: "END" }], nodes)).toBe("-> END");

    const text = responsesToText(responses, nodes);

    expect(text).toContain(`[if metLilly=0] What's your name? -> first`);
    expect(text).toContain(`I'm hungry. -> second`);
    expect(text).toContain(`I don't know. -> unknown`);
    expect(text).toContain(`Nothing for now. -> END`);
  });
});
