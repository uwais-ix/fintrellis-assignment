import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { setMockScenario } from "@/mocks/scenario";
import { renderWithProviders } from "@/test/render";
import { PostsPage } from "./posts-page";

describe("posts page", () => {
  it("renders notes returned by the API", async () => {
    renderWithProviders(<PostsPage />);

    expect(screen.getByRole("heading", { name: "Notes worth keeping." })).toBeInTheDocument();
    expect(await screen.findByText("A calmer way to review a release")).toBeInTheDocument();
    expect(screen.getByText("Why we write decisions down")).toBeInTheDocument();
  });

  it("explains an empty journal and offers the first step", async () => {
    setMockScenario("empty");
    renderWithProviders(<PostsPage />);

    expect(
      await screen.findByText("The journal is waiting for its first note"),
    ).toBeInTheDocument();
  });

  it("shows a recoverable problem when the service fails", async () => {
    setMockScenario("error");
    renderWithProviders(<PostsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Service unavailable");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("submits a search and reflects it in the query", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostsPage />);
    await screen.findByText("A calmer way to review a release");

    await user.type(screen.getByRole("textbox", { name: "Search notes" }), "pairing");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Notes from a week of pairing")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Why we write decisions down")).not.toBeInTheDocument(),
    );
  });
});
