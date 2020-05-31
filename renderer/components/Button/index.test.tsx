import React from "react";
import { render, fireEvent } from "@testing-library/react";

import Button from ".";

describe("Button", () => {
  it("can be clicked", () => {
    expect.hasAssertions();

    const onClick = jest.fn();
    const { container, rerender } = render(<Button>Test Button</Button>);

    expect(container.firstChild.textContent).toContain("Test Button");
    // Does nothing
    fireEvent.click(container.firstChild);

    rerender(<Button onClick={onClick}>Test Button</Button>);

    fireEvent.click(container.firstChild);
    expect(onClick).toHaveBeenCalled();
  });
});
