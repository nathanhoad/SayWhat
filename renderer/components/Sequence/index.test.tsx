import { render, fireEvent } from "@testing-library/react";

import Sequence from ".";

let mockHasUnsavedChanges = false;
const mockOpenSequenceList = jest.fn();
const mockEditSequence = jest.fn();
const mockRemoveSequence = jest.fn();
const mockSelectNode = jest.fn();
const mockAddNode = jest.fn();
let mockSelectedSequence = null;
let mockSelectedNode = null;
jest.mock("../../hooks/useApplication", () => {
  return () => ({
    userInterface: {
      hasUnsavedChanges: mockHasUnsavedChanges
    },
    openSequencesList: mockOpenSequenceList,
    selectedSequence: mockSelectedSequence,
    editSequence: mockEditSequence,
    removeSequence: mockRemoveSequence,
    selectNode: mockSelectNode,
    selectedNode: mockSelectedNode,
    addNode: mockAddNode
  });
});

jest.mock("../NodeList", () => {
  return (props: any) => <div data-testid={`node-count-${props.nodes?.length}`} />;
});

describe("Sequence", () => {
  const realQuerySelector = document.querySelector;
  const realSetTimeout = window.setTimeout;

  afterAll(() => {
    document.querySelector = realQuerySelector;
    window.setTimeout = realSetTimeout;
  });

  it("renders with no selected sequence", () => {
    expect.hasAssertions();

    const { queryByTestId } = render(<Sequence />);

    const sequencesButton = queryByTestId("sequences-button");
    expect(sequencesButton.textContent).toBe("Sequences");
  });

  it("renders with a selected sequence", () => {
    expect.hasAssertions();

    mockHasUnsavedChanges = true;
    mockSelectedSequence = {
      name: "Test Sequence",
      nodes: []
    };

    const { queryByTestId } = render(<Sequence />);
    const sequencesButton = queryByTestId("sequences-button");
    expect(sequencesButton.textContent).toBe("Test Sequence");
  });

  it("can show the sequences list", () => {
    expect.hasAssertions();
    mockRemoveSequence.mockReset();

    const { queryByTestId } = render(<Sequence />);

    fireEvent.click(queryByTestId("delete-button"));
    expect(mockRemoveSequence).toHaveBeenCalled();
  });

  it("can edit a sequence", () => {
    expect.hasAssertions();
    mockEditSequence.mockReset();

    const { queryByTestId } = render(<Sequence />);

    fireEvent.click(queryByTestId("edit-button"));
    expect(mockEditSequence).toHaveBeenCalled();
  });

  it("can delete a sequence", () => {
    expect.hasAssertions();
    mockOpenSequenceList.mockReset();

    const { queryByTestId } = render(<Sequence />);

    fireEvent.click(queryByTestId("sequences-button"));
    expect(mockOpenSequenceList).toHaveBeenCalled();
  });

  it("can add a node", () => {
    expect.hasAssertions();
    mockAddNode.mockReset();

    mockSelectedSequence = {
      name: "Test Sequence",
      nodes: []
    };

    const { queryByTestId } = render(<Sequence />);
    fireEvent.click(queryByTestId("add-node-button"));
    expect(mockAddNode).toHaveBeenCalled();
  });

  it("can filter nodes", () => {
    expect.hasAssertions();

    mockSelectedSequence = {
      name: "Test Sequence",
      nodes: [
        {
          id: "node1",
          name: "Node 1",
          updatedAt: null,
          lines: [],
          options: []
        }
      ]
    };

    const { queryByTestId } = render(<Sequence />);

    expect(queryByTestId("node-count-1")).not.toBeNull();
    fireEvent.change(queryByTestId("filter-input"), { target: { value: "test" } });
    expect(queryByTestId("node-count-0")).not.toBeNull();
  });

  it("can focus a node when it is selected", () => {
    expect.hasAssertions();

    mockSelectedSequence = {
      name: "Test Sequence",
      nodes: [
        {
          id: "node1",
          name: "Node 1",
          updatedAt: null,
          lines: [],
          options: []
        }
      ]
    };
    const mockScrollIntoView = jest.fn();

    const mockSetTimeout = jest.fn() as any;
    mockSetTimeout.__promisify__ = (ms: number) => Promise.resolve();
    window.setTimeout = mockSetTimeout;

    // Initially the node cannot be found
    document.querySelector = (query: string) => null;
    mockSelectedNode = mockSelectedSequence.nodes[0];
    const { rerender } = render(<Sequence />);

    expect(mockSetTimeout).toHaveBeenCalled();
    expect(mockScrollIntoView).not.toHaveBeenCalled();

    // And now the node can be found
    const el = document.createElement("div");
    Object.defineProperty(el, "scrollIntoView", { value: mockScrollIntoView });
    document.querySelector = (query: string) => el;

    mockSelectedNode = null;
    rerender(<Sequence />);
    mockSelectedNode = mockSelectedSequence.nodes[0];
    rerender(<Sequence />);

    expect(mockScrollIntoView).toHaveBeenCalled();
  });
});
