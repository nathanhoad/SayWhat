import React from "react";
import { render, fireEvent } from "@testing-library/react";

import NodePicker from ".";
import { INode } from "../../../types";

describe("NodePicker", () => {
  it("", () => {
    expect.hasAssertions();

    const nodes: Array<INode> = [
      {
        id: "node1",
        name: "Node 1",
        updatedAt: null,
        lines: [],
        responses: []
      }
    ];
    const onPickNextNode = jest.fn();

    const { queryByTestId, rerender } = render(
      <NodePicker isOpen={false} nodes={nodes} onPickNextNode={onPickNextNode} />
    );
    expect(queryByTestId("overlay")).toBeNull();

    rerender(<NodePicker isOpen={true} nodes={nodes} onPickNextNode={onPickNextNode} />);
    expect(queryByTestId("overlay")).not.toBeNull();

    fireEvent.click(queryByTestId("overlay"));
    expect(onPickNextNode).toHaveBeenCalledTimes(1);
    expect(onPickNextNode).toHaveBeenLastCalledWith(null);

    fireEvent.click(queryByTestId("cancel-button"));
    expect(onPickNextNode).toHaveBeenCalledTimes(2);
    expect(onPickNextNode).toHaveBeenLastCalledWith(null);

    fireEvent.click(queryByTestId("node"));
    expect(onPickNextNode).toHaveBeenCalledTimes(3);
    expect(onPickNextNode).toHaveBeenLastCalledWith(nodes[0]);
  });
});
