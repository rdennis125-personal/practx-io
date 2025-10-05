import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Modal } from "../Modal";

describe("Modal", () => {
  it("renders when open and traps focus", async () => {
    const user = userEvent.setup();
    const handleOpenChange = jest.fn();
    render(
      <Modal open onOpenChange={handleOpenChange} title="Example" description="Details" footer={<button type="button">Close</button>}>
        <button type="button">Confirm</button>
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    await user.keyboard("{Tab}");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("closes with escape key", async () => {
    const user = userEvent.setup();
    const handleOpenChange = jest.fn();
    render(
      <Modal open onOpenChange={handleOpenChange} title="Dismissible">
        <p>Body</p>
      </Modal>
    );
    await user.keyboard("{Escape}");
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("meets axe guidelines", async () => {
    const { container } = render(
      <Modal open onOpenChange={() => {}} title="Accessible modal">
        <p>Modal body</p>
      </Modal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
