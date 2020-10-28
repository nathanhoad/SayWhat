import React from "react";
import { render } from "@testing-library/react";

import Lines from "./Lines";

jest.mock("../LinkToNode", () => (props: any) => <div data-testid={props.from.goToNodeName} />);

describe("Lines", () => {
  it("renders a list of lines", () => {
    expect.hasAssertions();

    const lines = [
      {
        id: "line1",
        condition: "condition=1",
        character: "Coco",
        dialogue: "Hello!"
      },
      {
        id: "line2",
        dialogue: ""
      },
      {
        id: "line3",
        mutation: "doThing"
      },
      {
        id: "line4",
        comment: "A comment"
      },
      {
        id: "line5",
        goToNodeName: "Something"
      }
    ];

    const { queryByTestId, rerender } = render(<Lines lines={lines} />);
    expect(queryByTestId("condition").textContent).toContain("if condition=1");
    expect(queryByTestId("character").textContent).toContain("Coco");
    expect(queryByTestId("dialogue").textContent).toContain("Hello!");

    expect(queryByTestId("blank")).not.toBeNull();

    expect(queryByTestId("mutation").textContent).toContain("doThing");

    expect(queryByTestId("comment").textContent).toContain("A comment");

    expect(queryByTestId("Something")).not.toBeNull();

    // Just make sure it doesn't crash
    rerender(<Lines lines={null} />);
  });
});
