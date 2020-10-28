import React from "react";
import { render } from "@testing-library/react";

import Responses from "./Responses";

jest.mock("../LinkToNode", () => {
  return ({ from }: { from: { id: string } }) => <div data-testid={`link-to-node-${from.id}`} />;
});

describe("Responses", () => {
  it("renders a list of responses", () => {
    expect.hasAssertions();

    const responses = [
      {
        id: "response1",
        condition: "condition=1",
        prompt: "Prompt?",
        nextNodeName: "END"
      },
      {
        id: "response2",
        nextNodeName: "Start",
        nextNodeId: "node1"
      }
    ];

    const { queryByTestId, rerender } = render(<Responses responses={responses} />);
    expect(queryByTestId("condition").textContent).toContain("condition=1");
    expect(queryByTestId("prompt").textContent).toContain("Prompt?");

    expect(queryByTestId("link-to-node-response1")).not.toBeNull();
    expect(queryByTestId("link-to-node-response2")).not.toBeNull();

    // Just make sure it doesn't crash
    rerender(<Responses responses={null} />);
  });
});
