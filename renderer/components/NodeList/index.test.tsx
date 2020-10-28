import React from "react";
import { render, fireEvent } from "@testing-library/react";

import NodeList from ".";
import { INode } from "../../../types";

jest.mock("../Node", () => {
  return (props: any) => <div data-testid={props["data-testid"]} onClick={props.onClick} />;
});

jest.mock("../Connection", () => {
  return (props: any) => <div data-testid={props["data-testid"]} />;
});

describe("NodeList", () => {
  it("renders with no nodes", () => {
    expect.hasAssertions();

    const { container, queryByTestId, rerender } = render(<NodeList nodes={null} onSelectNode={null} />);
    expect(container.firstElementChild).toBeNull();

    rerender(<NodeList nodes={[]} onSelectNode={null} />);
    expect(queryByTestId("no-nodes")).not.toBeNull();
  });

  it("renders a list of nodes", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: "node1",
        name: "Node 1",
        updatedAt: null,
        lines: [],
        responses: [
          {
            id: "response1",
            goToNodeId: "node2",
            goToNodeName: "Node 2"
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
            id: "response2",
            prompt: "Response 2",
            goToNodeId: "node1",
            goToNodeName: "Node 1"
          }
        ]
      }
    ];
    const mockOnSelectNode = jest.fn();

    const { queryByTestId } = render(
      <NodeList nodes={nodes} selectedNode={nodes[0]} onSelectNode={mockOnSelectNode} />
    );

    expect(queryByTestId("node-node1")).not.toBeNull();
    expect(queryByTestId("node-node2")).not.toBeNull();
    expect(queryByTestId("outgoing-connection")).not.toBeNull();
    expect(queryByTestId("incoming-connection")).not.toBeNull();

    fireEvent.click(queryByTestId("node-node1"));
    expect(mockOnSelectNode).toHaveBeenCalledWith(nodes[0]);
  });
});
