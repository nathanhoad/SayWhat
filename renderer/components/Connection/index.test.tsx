import React from "react";
import { render } from "@testing-library/react";

import Connection from ".";

jest.mock("../../hooks/useNodes", () => {
  return () => ({
    byChildId: {
      fromElement: {
        id: "nodeElement"
      }
    }
  });
});

describe("Connection", () => {
  const realGetElementById = document.getElementById;

  function mockNodeDiv(id, top: number, height: number, hasParent: boolean = false) {
    const div = document.createElement("div");
    div.id = id;
    Object.defineProperty(div, "offsetTop", { value: top });
    Object.defineProperty(div, "offsetHeight", { value: height });
    if (hasParent) {
      Object.defineProperty(div, "parentElement", { value: mockNodeDiv("nodeElement", top, height) });
    }
    return div;
  }

  afterAll(() => {
    document.getElementById = realGetElementById;
  });

  it("can render downward outgoing connections", () => {
    expect.hasAssertions();

    // Mock out the elements that we are connecting
    document.getElementById = function (id: string) {
      switch (id) {
        case "fromElement":
          return mockNodeDiv(id, 0, 100, true);
        case "toElement":
          return mockNodeDiv(id, 100, 100);
        case "nodeElement":
          return mockNodeDiv(id, 0, 100);

        default:
          return realGetElementById(id);
      }
    };

    const { container } = render(<Connection fromId="fromElement" toId="toElement" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders nothing if there is no toElement", () => {
    expect.hasAssertions();

    // Mock out the elements that we are connecting
    document.getElementById = function (id: string) {
      switch (id) {
        case "fromElement":
          return mockNodeDiv(id, 0, 100, true);
        case "toElement":
          return null;
        case "nodeElement":
          return mockNodeDiv(id, 0, 100);

        default:
          return realGetElementById(id);
      }
    };

    const { container } = render(<Connection fromId="fromElement" toId="toElement" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("can render upward outgoing connections", () => {
    expect.hasAssertions();

    // Mock out the elements that we are connecting
    document.getElementById = function (id: string) {
      switch (id) {
        case "fromElement":
          return mockNodeDiv(id, 100, 100, true);
        case "toElement":
          return mockNodeDiv(id, 0, 100);
        case "nodeElement":
          return mockNodeDiv(id, 100, 100);

        default:
          return realGetElementById(id);
      }
    };

    const { container } = render(<Connection index={2} fromId="fromElement" toId="toElement" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("can render incoming connections", () => {
    expect.hasAssertions();

    // Mock out the elements that we are connecting
    document.getElementById = function (id: string) {
      switch (id) {
        case "fromElement":
          return mockNodeDiv(id, 100, 100, true);
        case "toElement":
          return mockNodeDiv(id, 0, 100);
        case "nodeElement":
          return mockNodeDiv(id, 100, 100);

        default:
          return realGetElementById(id);
      }
    };

    const { container } = render(<Connection direction="in" fromId="fromElement" toId="toElement" />);

    expect(container.firstChild).toMatchSnapshot();
  });
});
