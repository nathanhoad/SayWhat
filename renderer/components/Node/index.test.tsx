import React from "react";
import { render, fireEvent } from "@testing-library/react";

import Node from ".";
import { INode } from "../../../types";

let mockSelectedSequence = null;
const mockSelectNode = jest.fn();
const mockUpdateNode = jest.fn();
const mockRemoveNode = jest.fn();
jest.mock("../../hooks/useApplication", () => {
  return () => ({
    selectedSequence: mockSelectedSequence,
    selectedNode: {
      id: "selectedNode"
    },
    selectNode: mockSelectNode,
    updateNode: mockUpdateNode,
    removeNode: mockRemoveNode
  });
});

jest.mock("./Lines", () => {
  return () => {
    return <div data-testid="lines"></div>;
  };
});

jest.mock("./Options", () => {
  return () => {
    return <div data-testid="options"></div>;
  };
});

jest.mock("../TextArea", () => {
  return ({ value, onChange, ...props }: { value: string; onChange: any; "data-testid": string }) => (
    <input value={value} onChange={e => onChange(e.target.value)} data-testid={props["data-testid"]} />
  );
});

jest.mock("../Button", () => {
  return ({ onClick, children, ...props }: { name: string; onClick: any; children: any; "data-testid": string }) => (
    <button onClick={onClick} data-testid={props["data-testid"]}>
      {children}
    </button>
  );
});

const mockCopyToClipboard = jest.fn();
jest.mock("../../lib/util", () => {
  return {
    copyToClipboard: (s: string) => mockCopyToClipboard(s),
    keyBy: jest.requireActual("../../lib/util").keyBy
  };
});

describe("Node", () => {
  it("can edit a node", () => {
    expect.hasAssertions();
    mockUpdateNode.mockReset();

    const node: INode = {
      id: "selectedNode",
      name: "Node Name",
      updatedAt: new Date(),
      lines: [
        {
          id: "lineId",
          character: "Coco",
          dialogue: "Hello"
        }
      ],
      options: [
        {
          id: "optionId",
          prompt: "That is all.",
          nextNodeId: null,
          nextNodeName: "END"
        }
      ]
    };

    const { queryByTestId } = render(<Node node={node} />);

    expect(queryByTestId("title").textContent).toContain("Node Name");
    expect(queryByTestId("save-button")).toBeNull();

    // Edit with an error
    fireEvent.click(queryByTestId("edit-button"));
    fireEvent.change(queryByTestId("name-input"), { target: { value: "New Title" } });
    fireEvent.change(queryByTestId("lines-input"), { target: { value: "Coco: That's different!\n[if bad" } });
    fireEvent.change(queryByTestId("options-input"), { target: { value: "-> END" } });

    // Save changes will fail due to error
    const saveButton = queryByTestId("save-button");
    expect(saveButton).not.toBeNull();
    fireEvent.click(saveButton);

    expect(queryByTestId("lines-error").textContent).toContain("Malformed");

    // Fix it
    fireEvent.change(queryByTestId("lines-input"), {
      target: { value: "Coco: It's fixed now!\n[if good] Coco: That's better" }
    });

    // Now we have an error in options
    fireEvent.change(queryByTestId("options-input"), { target: { value: "[if bad" } });
    fireEvent.click(saveButton);
    expect(queryByTestId("options-error").textContent).toContain("Malformed");

    // Fix it
    fireEvent.change(queryByTestId("options-input"), { target: { value: "-> END" } });

    // Save should now work fine
    fireEvent.click(saveButton);
    expect(queryByTestId("save-button")).toBeNull();
    expect(mockUpdateNode).toHaveBeenCalled();
  });

  it("ignores main onClick while editing", () => {
    expect.hasAssertions();
    mockUpdateNode.mockReset();

    const node: INode = {
      id: "selectedNode",
      name: "Node Name",
      updatedAt: new Date(),
      lines: [],
      options: []
    };
    const onClick = jest.fn();

    const { queryByTestId } = render(<Node node={node} onClick={onClick} />);

    fireEvent.click(queryByTestId("node"));
    expect(onClick).toHaveBeenCalled();

    fireEvent.click(queryByTestId("edit-button"));

    onClick.mockReset();
    fireEvent.click(queryByTestId("node"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("automatically sets new nodes to be editing", () => {
    expect.hasAssertions();
    mockRemoveNode.mockReset();

    const node: INode = {
      id: "nodeId",
      name: "Node Name",
      updatedAt: null,
      lines: [],
      options: []
    };

    const { queryByTestId } = render(<Node node={node} />);
    expect(queryByTestId("name-input")).not.toBeNull();

    fireEvent.click(queryByTestId("cancel-button"));
    expect(mockRemoveNode).toHaveBeenCalled();
  });

  it("starts editing a node on double click", () => {
    expect.hasAssertions();

    const node: INode = {
      id: "nodeId",
      name: "Node Name",
      updatedAt: new Date(),
      lines: [
        {
          id: "lineId",
          character: "Coco",
          dialogue: "Hello"
        }
      ],
      options: [
        {
          id: "optionId",
          prompt: "That is all.",
          nextNodeId: null,
          nextNodeName: "END"
        }
      ]
    };

    const { container, queryByTestId } = render(<Node node={node} />);
    fireEvent.doubleClick(container.firstElementChild);
    expect(queryByTestId("name-input")).not.toBeNull();
  });

  it("can cancel changes to a node", () => {
    expect.hasAssertions();

    const node: INode = {
      id: "nodeId",
      name: "Node Name",
      updatedAt: new Date(),
      lines: [
        {
          id: "lineId",
          character: "Coco",
          dialogue: "Hello"
        }
      ],
      options: [
        {
          id: "optionId",
          prompt: "That is all.",
          nextNodeId: null,
          nextNodeName: "END"
        }
      ]
    };

    const { queryByTestId } = render(<Node node={node} />);
    fireEvent.click(queryByTestId("edit-button"));

    fireEvent.click(queryByTestId("cancel-button"));

    expect(queryByTestId("title").textContent).toContain("Node Name");
    expect(queryByTestId("save-button")).toBeNull();
  });

  it("can delete a node", () => {
    expect.hasAssertions();
    mockRemoveNode.mockReset();

    const node: INode = {
      id: "nodeId",
      name: "Node name",
      updatedAt: new Date(),
      lines: [
        {
          id: "lineId",
          character: "Coco",
          dialogue: "Hello"
        }
      ],
      options: [
        {
          id: "optionId",
          prompt: "That is all.",
          nextNodeId: null,
          nextNodeName: "END"
        }
      ]
    };

    const { queryByTestId } = render(<Node node={node} />);
    fireEvent.click(queryByTestId("delete-button"));

    expect(mockRemoveNode).toHaveBeenCalled();
  });

  describe("node id", () => {
    const realSetTimeout = window.setTimeout;

    beforeEach(() => {
      window.setTimeout = realSetTimeout;
    });

    afterEach(() => {
      window.setTimeout = realSetTimeout;
    });

    it("can copy the node ID to the clipboard", () => {
      expect.hasAssertions();

      const node: INode = {
        id: "nodeId",
        name: "Node name",
        updatedAt: new Date(),
        lines: [],
        options: []
      };

      Object.defineProperty(window, "setTimeout", { value: (cb: Function, milliseconds: number) => cb() });

      const { queryByTestId } = render(<Node node={node} />);
      fireEvent.click(queryByTestId("copy-to-clipboard-button"));

      expect(mockCopyToClipboard).toHaveBeenCalledWith("nodeId");
    });
  });
});
