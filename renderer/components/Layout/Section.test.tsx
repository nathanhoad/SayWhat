import { render } from "@testing-library/react";

import Section from "./Section";

describe("Section", () => {
  it("renders", () => {
    expect.hasAssertions();

    const { container } = render(<Section>SectionContent</Section>);
    expect(container.firstElementChild).toMatchSnapshot();
  });
});
