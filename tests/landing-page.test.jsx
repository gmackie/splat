import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LandingPage } from "../src/LandingPage.jsx";

function setViewportWidth(width) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width
  });
}

function setViewportHeight(height) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: height
  });
}

function setViewportSize({ width = window.innerWidth, height = window.innerHeight }) {
  setViewportWidth(width);
  setViewportHeight(height);
  window.dispatchEvent(new Event("resize"));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LandingPage", () => {
  it("shows the splat hero and waitlist form", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", {
        name: /wild places deserve a better memory/i
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /claim a waitlist spot/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/for hikers, artists, and obsessive note-takers/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("switches the waitlist panel into a centered layout on tighter screens", () => {
    setViewportSize({ width: 1100, height: 1000 });

    render(<LandingPage />);

    expect(
      screen
        .getByRole("heading", { name: /claim a spot on the first drop/i })
        .closest("section")
    ).toHaveClass("waitlist-panel-compact");
  });

  it("switches the waitlist panel into a centered layout on shorter screens", () => {
    setViewportSize({ width: 1440, height: 820 });

    render(<LandingPage />);

    expect(
      screen
        .getByRole("heading", { name: /claim a spot on the first drop/i })
        .closest("section")
    ).toHaveClass("waitlist-panel-compact");
  });

  it("submits the email address and shows a success message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true })
    });

    render(<LandingPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "hello@example.com" }
    });
    fireEvent.click(
      screen.getByRole("button", { name: /claim a waitlist spot/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/you are on the list/i)
      ).toBeInTheDocument();
    });
  });
});
