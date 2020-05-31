import { render } from "@testing-library/react";

import Panel from "./Panel";

describe("Panel", () => {
  it("renders", () => {
    expect.hasAssertions();

    const { container } = render(<Panel>PanelContent</Panel>);
    expect(container.firstElementChild).toMatchSnapshot();
  });
});
