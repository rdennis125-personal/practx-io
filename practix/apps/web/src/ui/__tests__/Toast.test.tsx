import React from "react";
import { renderHook, act } from "@testing-library/react";
import { axe } from "jest-axe";
import { ToastProvider, useToast } from "../Toast";
import { render, screen } from "@testing-library/react";

describe("Toast", () => {
  it("pushes and dismisses notifications", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.push({ title: "Saved", description: "Device updated" });
    });
    const toast = screen.getByText(/device updated/i);
    expect(toast).toBeInTheDocument();
    act(() => {
      result.current.dismiss(1);
    });
    expect(toast).not.toBeInTheDocument();
  });

  it("meets axe guidelines", async () => {
    const { container } = render(
      <ToastProvider>
        <div>children</div>
      </ToastProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
