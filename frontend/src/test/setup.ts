import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { resetMockData } from "@/mocks/handlers";
import { setMockRole, setMockScenario } from "@/mocks/scenario";
import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockData();
  setMockRole("editor");
  setMockScenario("populated");
  localStorage.clear();
});

afterAll(() => server.close());
