import { render } from "@testing-library/react";

import Header from "./Header";

describe("Header", () => {
  it("renders", () => {
    expect.hasAssertions();

    const { container } = render(<Header>HeaderContent</Header>);
    expect(container.firstElementChild).toMatchSnapshot();
  });
});
