import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { Button } from "../Button";

describe("Button", () => {
  it("renders label and handles click", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Primary</Button>);
    const button = screen.getByRole("button", { name: /primary/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it("disables interaction while loading", () => {
    const handleClick = jest.fn();
    render(
      <Button loading onClick={handleClick}>
        Loading
      </Button>
    );
    const button = screen.getByRole("button", { name: /loading/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("meets axe guidelines", async () => {
    const { container } = render(<Button>Accessible</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
