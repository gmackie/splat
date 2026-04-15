import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LandingPage } from "../src/LandingPage.jsx";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LandingPage", () => {
  it("shows the splat hero and waitlist form", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", {
        name: /turn real spaces into explorable splat scenes/i
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /join the waitlist/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: /join the waitlist/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/you are on the list/i)
      ).toBeInTheDocument();
    });
  });
});
