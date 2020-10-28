import { v4 as uuid } from "uuid";

import {
  keyBy,
  sortBy,
  findLinksToNode,
  plural,
  filterNodes,
  getNodesByChildId,
  copyToClipboard,
  findLinksFromNode
} from "./util";
import { INode } from "../../types";

describe("plural", () => {
  it("pluralises a word automatically", () => {
    expect.hasAssertions();

    expect(plural(0, "thing")).toBe("0 things");
    expect(plural(1, "thing")).toBe("1 thing");
    expect(plural(101, "thing")).toBe("101 things");
  });

  it("pluralises a word manually", () => {
    expect.hasAssertions();

    expect(plural(0, "octopus", "octopi")).toBe("0 octopi");
    expect(plural(1, "octopus", "octopi")).toBe("1 octopus");
    expect(plural(101, "octopus", "octopi")).toBe("101 octopi");
  });
});

describe("keyBy", () => {
  it("can create an object from an array", () => {
    expect.hasAssertions();

    expect(Object.keys(keyBy("nothing", null))).toHaveLength(0);

    const input = [
      {
        slug: "first",
        value: "The first one"
      },
      {
        slug: "second",
        value: "The second thing"
      },
      {
        slug: "third",
        value: "Last one"
      }
    ];

    const bySlug = keyBy("slug", input);

    expect(bySlug.first.value).toBe(input[0].value);
    expect(bySlug.second.value).toBe(input[1].value);
    expect(bySlug.third.value).toBe(input[2].value);
  });
});

describe("sortBy", () => {
  it("returns a new sorted array", () => {
    expect.hasAssertions();

    const input = [
      {
        slug: "first",
        value: "b"
      },
      {
        slug: "second",
        value: "c"
      },
      {
        slug: "third",
        value: "a"
      },
      {
        slug: "fourth",
        value: "a"
      }
    ];

    const sorted = sortBy("value", input);

    // Didn't change the original array
    expect(input[0].slug).toBe("first");
    expect(input[1].slug).toBe("second");
    expect(input[2].slug).toBe("third");
    expect(input[3].slug).toBe("fourth");

    // But did return a sorted aray
    expect(sorted[0].slug).toBe("third");
    expect(sorted[1].slug).toBe("fourth");
    expect(sorted[2].slug).toBe("first");
    expect(sorted[3].slug).toBe("second");
  });
});

describe("findLinksToNode", () => {
  it("finds any other node that links to this one", () => {
    expect.hasAssertions();

    const targetNode: INode = {
      id: "target",
      name: "Target Node",
      updatedAt: null,
      lines: [],
      responses: []
    };

    const nodes: Array<INode> = [
      targetNode,
      {
        id: "link1",
        name: "link1",
        updatedAt: null,
        lines: [
          {
            id: "line1",
            goToNodeId: "target"
          }
        ],
        responses: [
          {
            id: "response1",
            goToNodeId: "nothing"
          },
          {
            id: "response2",
            goToNodeId: "target"
          }
        ]
      },
      {
        id: "link2",
        name: "link2",
        updatedAt: null,
        lines: [],
        responses: [
          {
            id: "response3",
            goToNodeId: "target"
          }
        ]
      },
      {
        id: "no_link",
        name: "no_link",
        updatedAt: null,
        lines: [],
        responses: [
          {
            id: "response4",
            goToNodeId: "nothing"
          }
        ]
      }
    ];

    expect(findLinksToNode(null, nodes)).toHaveLength(0);

    const links = findLinksToNode(targetNode, nodes);
    expect(links).toHaveLength(3);
    expect(links[0]).toBe("line1");
    expect(links[1]).toBe("response2");
    expect(links[2]).toBe("response3");
  });
});

describe("findLinksFromNode", () => {
  it("can list any out going links", () => {
    expect.hasAssertions();

    const node: INode = {
      id: uuid(),
      lines: [
        {
          id: "line1",
          goToNodeId: "next"
        },
        {
          id: uuid(),
          goToNodeId: null
        }
      ],
      responses: [
        {
          id: "response1",
          goToNodeId: "next"
        },
        {
          id: uuid(),
          goToNodeId: null
        }
      ]
    };

    const links = findLinksFromNode(node);
    expect(links).toHaveLength(2);
    expect(links[0]).toEqual({ fromId: "line1", toId: "next" });
    expect(links[1]).toEqual({ fromId: "response1", toId: "next" });
  });
});

describe("filterNodes", () => {
  it("returns nothing when no nodes are given", () => {
    expect.hasAssertions();

    expect(filterNodes("test", null)).toHaveLength(0);
  });

  it("filters by slug", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: "id1",
        name: "slug1",
        updatedAt: null,
        lines: [],
        responses: []
      },
      {
        id: "id2",
        name: "slug2",
        updatedAt: null,
        lines: [],
        responses: []
      },
      {
        id: "id3",
        name: "slug3",
        updatedAt: null,
        lines: [],
        responses: [
          {
            id: "response1",
            goToNodeId: "id3",
            goToNodeName: "slug1"
          }
        ]
      }
    ];

    let filteredNodes = filterNodes("slug2", nodes);
    expect(filteredNodes).toHaveLength(1);
    expect(filteredNodes[0].id).toBe(nodes[1].id);

    filteredNodes = filterNodes("slug1", nodes);
    // The third node contains a link to the first
    expect(filteredNodes).toHaveLength(2);
    expect(filteredNodes[0].id).toBe(nodes[0].id);
    expect(filteredNodes[1].id).toBe(nodes[2].id);
  });

  it("filters by lines", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: "id1",
        name: "slug1",
        updatedAt: null,
        lines: [
          {
            id: "line1",
            condition: "condition=1",
            character: "Character",
            dialogue: "Dialogue",
            mutation: "mutation",
            goToNodeName: "goto"
          },
          {
            id: "line2",
            condition: "nothing",
            character: "nothing",
            dialogue: "nothing",
            mutation: "nothing",
            goToNodeName: "nothing"
          }
        ],
        responses: []
      }
    ];

    let filteredNodes = filterNodes("No matches", nodes);
    expect(filteredNodes).toHaveLength(0);

    filteredNodes = filterNodes("condition", nodes);
    expect(filteredNodes).toHaveLength(1);

    filteredNodes = filterNodes("character", nodes);
    expect(filteredNodes).toHaveLength(1);

    filteredNodes = filterNodes("dialog", nodes);
    expect(filteredNodes).toHaveLength(1);

    filteredNodes = filterNodes("mutat", nodes);
    expect(filteredNodes).toHaveLength(1);

    filteredNodes = filterNodes("goto", nodes);
    expect(filteredNodes).toHaveLength(1);
  });

  it("filters by responses", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: "id1",
        name: "slug1",
        updatedAt: null,
        lines: [],
        responses: [
          {
            id: "response1",
            condition: "condition=1",
            prompt: "Prompt",
            goToNodeName: "next_slug"
          }
        ]
      }
    ];

    let filteredNodes = filterNodes("No matches", nodes);
    expect(filteredNodes).toHaveLength(0);

    filteredNodes = filterNodes("condition", nodes);
    expect(filteredNodes).toHaveLength(1);

    filteredNodes = filterNodes("prompt", nodes);
    expect(filteredNodes).toHaveLength(1);

    filteredNodes = filterNodes("next_sl", nodes);
    expect(filteredNodes).toHaveLength(1);
  });
});

describe("getNodesByChildId", () => {
  it("returns an empty dictionary when given no nodes", () => {
    expect.hasAssertions();

    expect(Object.keys(getNodesByChildId(null))).toHaveLength(0);
  });

  it("keys nodes by their response IDs", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: "node1",
        name: "Node 1",
        updatedAt: null,
        lines: [
          {
            id: "line1"
          }
        ],
        responses: [
          {
            id: "response1",
            prompt: "Next!",
            goToNodeId: "node2",
            goToNodeName: "Node 2"
          },
          {
            id: "response2",
            prompt: "That is all",
            goToNodeId: null,
            goToNodeName: "END"
          }
        ]
      },
      {
        id: "node2",
        name: "Node 2",
        updatedAt: null,
        lines: [],
        responses: [
          {
            id: "response3",
            goToNodeId: null,
            goToNodeName: "END"
          }
        ]
      }
    ];

    const byChildId = getNodesByChildId(nodes);

    expect(Object.keys(byChildId)).toHaveLength(4);
    expect(byChildId["line1"].id).toBe("node1");
    expect(byChildId["response1"].id).toBe("node1");
    expect(byChildId["response2"].id).toBe("node1");
    expect(byChildId["response3"].id).toBe("node2");
  });
});

describe("copyToClipboard", () => {
  const realExec = document.execCommand;

  beforeEach(() => {
    document.execCommand = realExec;
  });

  it("copies a string to the clipboard", () => {
    expect.hasAssertions();

    const mockExec = jest.fn();
    document.execCommand = mockExec;

    const mockAlert = jest.fn();
    window.alert = mockAlert;

    copyToClipboard("test");

    expect(mockExec).toHaveBeenCalledWith("copy");
  });
});
