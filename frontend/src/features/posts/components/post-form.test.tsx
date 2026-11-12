import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PostForm } from "./post-form";

describe("post form", () => {
  it("shows field-level messages instead of submitting invalid input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(
      <PostForm
        submitLabel="Publish note"
        pending={false}
        problem={null}
        onSubmit={onSubmit}
        onCancel={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Publish note" }));

    expect(await screen.findByText("Enter a title.")).toBeInTheDocument();
    expect(screen.getByText("Write some content.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values when the form is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(
      <PostForm
        submitLabel="Publish note"
        pending={false}
        problem={null}
        onSubmit={onSubmit}
        onCancel={() => undefined}
      />,
    );

    await user.type(screen.getByLabelText("Title"), "  A useful title  ");
    await user.type(screen.getByLabelText("Content"), "  A useful body.  ");
    await user.click(screen.getByRole("button", { name: "Publish note" }));

    expect(onSubmit).toHaveBeenCalledWith({ title: "A useful title", content: "A useful body." });
  });

  it("disables actions while a save is pending", () => {
    renderWithProviders(
      <PostForm
        submitLabel="Save changes"
        pending
        problem={null}
        onSubmit={() => undefined}
        onCancel={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: /Saving/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
