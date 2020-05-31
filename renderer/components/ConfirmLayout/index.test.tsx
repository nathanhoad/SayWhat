import { render, fireEvent } from "@testing-library/react";

import ConfirmLayout from ".";

let mockConfirmDialog = null;
const mockResponseToConfirmDialogue = jest.fn();
jest.mock("../../hooks/useApplication", () => {
  return () => ({
    userInterface: {
      confirmDialog: mockConfirmDialog
    },
    respondToConfirmDialog: mockResponseToConfirmDialogue
  });
});

jest.mock("../Button", () => {
  return (props: any) => (
    <button data-testid={props["data-testid"]} onClick={props.onClick}>
      {props.children}
    </button>
  );
});

describe("ConfirmLayout", () => {
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

    const { container, queryByTestId, rerender } = render(<ConfirmLayout />);
    expect(container.firstElementChild).toBeNull();

    mockConfirmDialog = {
      message: "Test?",
      buttons: ["OK", "Cancel"]
    };
    rerender(<ConfirmLayout />);
    expect(queryByTestId("message").textContent).toBe("Test?");
  });

  it("can confirm", () => {
    expect.hasAssertions();

    mockConfirmDialog = {
      message: "Test?",
      buttons: ["OK", "Cancel"]
    };
    const { queryByTestId } = render(<ConfirmLayout />);

    const okButton = queryByTestId("OK-button");
    fireEvent.click(okButton);
    expect(mockResponseToConfirmDialogue).toHaveBeenCalledWith("OK");
    expect(mockWindowclose).toHaveBeenCalled();

    mockWindowclose.mockReset();
    mockResponseToConfirmDialogue.mockReset();

    const cancelButton = queryByTestId("Cancel-button");
    fireEvent.click(cancelButton);
    expect(mockResponseToConfirmDialogue).toHaveBeenCalledWith("Cancel");
    expect(mockWindowclose).toHaveBeenCalled();
  });

  it("can be used with the keyboard", () => {
    expect.hasAssertions();

    mockConfirmDialog = {
      message: "Test?",
      buttons: ["OK", "Cancel"]
    };
    render(<ConfirmLayout />);

    mockWindowclose.mockReset();
    mockResponseToConfirmDialogue.mockReset();
    fireEvent.keyUp(window, { keyCode: 96 });
    expect(mockResponseToConfirmDialogue).not.toHaveBeenCalled();
    expect(mockWindowclose).not.toHaveBeenCalled();

    mockWindowclose.mockReset();
    mockResponseToConfirmDialogue.mockReset();
    fireEvent.keyUp(window, { keyCode: 13 });
    expect(mockResponseToConfirmDialogue).toHaveBeenCalledWith("OK");
    expect(mockWindowclose).toHaveBeenCalled();

    mockWindowclose.mockReset();
    mockResponseToConfirmDialogue.mockReset();
    fireEvent.keyUp(window, { keyCode: 27 });
    expect(mockResponseToConfirmDialogue).toHaveBeenCalledWith("Cancel");
    expect(mockWindowclose).toHaveBeenCalled();
  });
});
