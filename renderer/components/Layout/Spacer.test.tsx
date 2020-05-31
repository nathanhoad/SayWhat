import { render } from "@testing-library/react";

import Spacer from "./Spacer";

describe("Spacer", () => {
  it("renders", () => {
    expect.hasAssertions();

    const { container } = render(<Spacer />);
    expect(container.firstElementChild).toMatchSnapshot();
  });
});
