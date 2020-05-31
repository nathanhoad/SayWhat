import { render, fireEvent } from "@testing-library/react";

import SequenceList from ".";

let mockProject = null;
let mockSelectedSequence = null;
const mockCloseSequencesList = jest.fn();
const mockSelectSequence = jest.fn();
const mockAddSequence = jest.fn();
jest.mock("../../hooks/useApplication", () => {
  return () => ({
    project: mockProject,
    selectedSequence: mockSelectedSequence,
    closeSequencesList: mockCloseSequencesList,
    selectSequence: mockSelectSequence,
    addSequence: mockAddSequence
  });
});

describe("SequenceList", () => {
  it("renders nothing when there is no project", () => {
    expect.hasAssertions();

    const { container } = render(<SequenceList />);
    expect(container.firstElementChild.textContent).toBe("");
  });

  it("renders a list of sequences", () => {
    expect.hasAssertions();

    mockProject = {
      sequences: [
        {
          id: "sequence1",
          name: "Test Sequence",
          nodes: []
        }
      ]
    };

    const { queryByTestId } = render(<SequenceList />);
    expect(queryByTestId("sequence-sequence1")).not.toBeNull();
  });

  it("can add a sequence", () => {
    expect.hasAssertions();
    mockAddSequence.mockReset();
    mockCloseSequencesList.mockReset();

    const { queryByTestId } = render(<SequenceList />);
    fireEvent.click(queryByTestId("add-button"));
    expect(mockAddSequence).toHaveBeenCalled();
    expect(mockCloseSequencesList).toHaveBeenCalled();
  });

  it("can select a sequence", () => {
    expect.hasAssertions();
    mockSelectSequence.mockReset();
    mockCloseSequencesList.mockReset();

    mockProject = {
      sequences: [
        {
          id: "sequence1",
          name: "Test Sequence",
          nodes: []
        }
      ]
    };

    const { queryByTestId } = render(<SequenceList />);
    fireEvent.click(queryByTestId("sequence-sequence1"));
    expect(mockSelectSequence).toHaveBeenCalled();
    expect(mockCloseSequencesList).toHaveBeenCalled();
  });
});
