import React from "react";
import { render, fireEvent } from "@testing-library/react";

import TextArea from ".";

describe("TextArea", () => {
  it("can resize with new lines", () => {
    expect.hasAssertions();

    const onChange = jest.fn();

    const { container, rerender } = render(<TextArea value="first line" onChange={onChange} />);

    fireEvent.change(container.firstChild, { target: { value: "first line\nsecond line" } });
    expect(onChange).toHaveBeenCalled();

    // It should be taller with more lines
    rerender(<TextArea value="first line\nsecond line" onChange={onChange} />);
  });
});
