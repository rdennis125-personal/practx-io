import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Input } from "../Input";

describe("Input", () => {
  it("associates label and helper text", async () => {
    const user = userEvent.setup();
    render(<Input label="Dealer" helperText="Contact email" placeholder="dealer@practx.io" />);
    const field = screen.getByLabelText(/dealer/i);
    await user.type(field, "hello");
    expect(field).toHaveValue("hello");
    expect(screen.getByText(/contact email/i)).toBeInTheDocument();
  });

  it("renders multiline variant", () => {
    render(<Input label="Notes" multiline />);
    expect(screen.getByRole("textbox", { name: /notes/i })).toBeInTheDocument();
  });

  it("meets axe guidelines", async () => {
    const { container } = render(<Input label="Email" type="email" required helperText="We will send updates." />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
