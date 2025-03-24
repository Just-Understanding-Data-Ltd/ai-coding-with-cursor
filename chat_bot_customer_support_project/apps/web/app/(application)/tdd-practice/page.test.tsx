import { expect, it, describe } from "vitest";
import { renderWithProviders } from "@/__tests__/test-utils";
import Page from "./page";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Testing", () => {
  it("Page renders some text", () => {
    renderWithProviders(<Page />);
    expect(screen.getByText("This is awesome")).toBeInTheDocument();
  });

  it("Submitting a form will lead to haha being on the page", () => {
    const user = userEvent.setup();
    const input = "sweet";
    renderWithProviders(<Page />);
    const formInput = screen.getByTestId("awesome");
    user.type(formInput, input);
    expect(screen.queryByText(input));
  });
});
