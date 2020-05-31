import { render, fireEvent } from "@testing-library/react";

import EditSequenceLayout from ".";

const mockUpdateSequence = jest.fn();
jest.mock("../../hooks/useApplication", () => {
  return () => ({
    selectedSequence: {
      name: "Test"
    },
    updateSequence: mockUpdateSequence
  });
});

jest.mock("../Button", () => {
  return (props: any) => (
    <button data-testid={props["data-testid"]} onClick={props.onClick}>
      {props.children}
    </button>
  );
});

describe("EditSequenceLayout", () => {
  const realWindowClose = window.close;
  const mockWindowclose = jest.fn();

  beforeAll(() => {
    window.close = mockWindowclose;
  });

  afterAll(() => {
    window.close = realWindowClose;
  });

  it("renders", () => {
    expect.hasAssertions();

    const { queryByTestId } = render(<EditSequenceLayout />);
    expect(queryByTestId("name-input")).not.toBeNull();
  });

  it("can rename a sequence", () => {
    expect.hasAssertions();

    const { queryByTestId } = render(<EditSequenceLayout />);

    const input = queryByTestId("name-input");
    expect(input).not.toBeNull();
    fireEvent.change(input, { target: { value: "New name" } });

    const saveButton = queryByTestId("save-button");
    fireEvent.click(saveButton);
    expect(mockUpdateSequence).toHaveBeenCalledWith({ name: "New name" });
    expect(mockWindowclose).toHaveBeenCalled();
  });

  it("can be closed", () => {
    expect.hasAssertions();

    const { queryByTestId } = render(<EditSequenceLayout />);

    mockWindowclose.mockReset();
    fireEvent.keyUp(window, { keyCode: 96 });
    expect(mockWindowclose).not.toHaveBeenCalled();

    mockWindowclose.mockReset();
    fireEvent.keyUp(window, { keyCode: 27 });
    expect(mockWindowclose).toHaveBeenCalled();

    mockWindowclose.mockReset();
    fireEvent.click(queryByTestId("cancel-button"));
    expect(mockWindowclose).toHaveBeenCalled();
  });
});
