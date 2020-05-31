import { render, fireEvent } from "@testing-library/react";

import ApplicationLayout from ".";

const mockCloseSequencesList = jest.fn();
jest.mock("../../hooks/useApplication", () => {
  return () => ({
    userInterface: {
      isSequencesListOpen: true
    },
    closeSequencesList: mockCloseSequencesList
  });
});

jest.mock("../Drawer", () => {
  return (props: any) => <div data-testid={props["data-testid"]} onClick={props.onClose} />;
});

describe("ApplicationLayout", () => {
  it("renders", () => {
    expect.hasAssertions();

    const { container, queryByTestId } = render(<ApplicationLayout />);
    expect(container.firstElementChild).toMatchSnapshot();

    expect(mockCloseSequencesList).not.toHaveBeenCalled();
    fireEvent.click(queryByTestId("drawer"));
    expect(mockCloseSequencesList).toHaveBeenCalled();
  });
});
