import React from "react";
import { render } from "@testing-library/react";

import Options from "./Options";

jest.mock("../LinkToNode", () => {
  return ({ fromOption }: { fromOption: { id: string } }) => <div data-testid={`link-to-node-${fromOption.id}`} />;
});

describe("Options", () => {
  it("renders a list of options", () => {
    expect.hasAssertions();

    const options = [
      {
        id: "option1",
        condition: "condition=1",
        prompt: "Prompt?",
        nextNodeName: "END"
      },
      {
        id: "option2",
        nextNodeName: "Start",
        nextNodeId: "node1"
      }
    ];

    const { queryByTestId, rerender } = render(<Options options={options} />);
    expect(queryByTestId("condition").textContent).toContain("condition=1");
    expect(queryByTestId("prompt").textContent).toContain("Prompt?");

    expect(queryByTestId("link-to-node-option1")).not.toBeNull();
    expect(queryByTestId("link-to-node-option2")).not.toBeNull();

    // Just make sure it doesn't crash
    rerender(<Options options={null} />);
  });
});
