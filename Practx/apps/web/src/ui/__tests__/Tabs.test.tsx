import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Tabs } from "../Tabs";

describe("Tabs", () => {
  const items = [
    { id: "one", label: "One", content: <p>First</p> },
    { id: "two", label: "Two", content: <p>Second</p> },
    { id: "three", label: "Three", content: <p>Third</p> }
  ];

  it("switches panels via keyboard", async () => {
    const user = userEvent.setup();
    render(<Tabs items={items} />);
    const firstTab = screen.getByRole("tab", { name: "One" });
    firstTab.focus();
    await act(async () => {
      await user.keyboard("{ArrowRight}");
    });
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Second")).toBeVisible();
  });

  it("passes axe accessibility scan", async () => {
    const { container } = render(<Tabs items={items} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
