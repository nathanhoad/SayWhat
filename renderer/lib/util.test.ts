import { v4 as uuid } from "uuid";

import { keyBy, sortBy, findLinksToNode, plural, filterNodes, getNodesByOptionId } from "./util";
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
      id: uuid(),
      name: "Target Node",
      updatedAt: null,
      lines: [],
      options: []
    };

    const nodes: Array<INode> = [
      targetNode,
      {
        id: uuid(),
        name: "link1",
        updatedAt: null,
        lines: [],
        options: [
          {
            id: uuid(),
            nextNodeId: uuid()
          },
          {
            id: uuid(),
            nextNodeId: targetNode.id
          }
        ]
      },
      {
        id: uuid(),
        name: "link2",
        updatedAt: null,
        lines: [],
        options: [
          {
            id: uuid(),
            nextNodeId: targetNode.id
          }
        ]
      },
      {
        id: uuid(),
        name: "no_link",
        updatedAt: null,
        lines: [],
        options: [
          {
            id: uuid(),
            nextNodeId: uuid()
          }
        ]
      }
    ];

    expect(findLinksToNode(null, nodes)).toHaveLength(0);

    const links = findLinksToNode(targetNode, nodes);
    expect(links).toHaveLength(2);
    expect(links[0]).toBe(nodes[1].options[1].id);
    expect(links[1]).toBe(nodes[2].options[0].id);
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
        options: []
      },
      {
        id: "id2",
        name: "slug2",
        updatedAt: null,
        lines: [],
        options: []
      },
      {
        id: "id3",
        name: "slug3",
        updatedAt: null,
        lines: [],
        options: [
          {
            id: "option1",
            nextNodeId: "id3",
            nextNodeName: "slug1"
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
            mutation: "mutation"
          }
        ],
        options: []
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
  });

  it("filters by options", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: "id1",
        name: "slug1",
        updatedAt: null,
        lines: [],
        options: [
          {
            id: "option1",
            condition: "condition=1",
            prompt: "Prompt",
            nextNodeName: "next_slug"
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

describe("getNodesByOptionId", () => {
  it("returns an empty dictionary when given no nodes", () => {
    expect.hasAssertions();

    expect(Object.keys(getNodesByOptionId(null))).toHaveLength(0);
  });

  it("keys nodes by their option IDs", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: "node1",
        name: "Node 1",
        updatedAt: null,
        lines: [],
        options: [
          {
            id: "option1",
            prompt: "Next!",
            nextNodeId: "node2",
            nextNodeName: "Node 2"
          },
          {
            id: "option2",
            prompt: "That is all",
            nextNodeId: null,
            nextNodeName: "END"
          }
        ]
      },
      {
        id: "node2",
        name: "Node 2",
        updatedAt: null,
        lines: [],
        options: [
          {
            id: "option3",
            nextNodeId: null,
            nextNodeName: "END"
          }
        ]
      }
    ];

    const byOptionId = getNodesByOptionId(nodes);

    expect(Object.keys(byOptionId)).toHaveLength(3);
    expect(byOptionId["option1"].id).toBe("node1");
    expect(byOptionId["option2"].id).toBe("node1");
    expect(byOptionId["option3"].id).toBe("node2");
  });
});
