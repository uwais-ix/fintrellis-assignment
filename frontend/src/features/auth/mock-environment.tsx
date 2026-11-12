import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  isMockMode,
  type MockRole,
  type MockScenario,
  setMockRole as publishMockRole,
  setMockScenario as publishMockScenario,
} from "@/mocks/scenario";

interface MockEnvironment {
  enabled: boolean;
  role: MockRole;
  scenario: MockScenario;
  setRole: (role: MockRole) => void;
  setScenario: (scenario: MockScenario) => void;
}

const storageKey = "journal-mock-environment";

const fallback: MockEnvironment = {
  enabled: false,
  role: "editor",
  scenario: "populated",
  setRole: () => undefined,
  setScenario: () => undefined,
};

const MockEnvironmentContext = createContext<MockEnvironment>(fallback);

function readStored(): { role: MockRole; scenario: MockScenario } {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { role: "editor", scenario: "populated" };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null)
      return { role: "editor", scenario: "populated" };
    const record = parsed as Record<string, unknown>;
    const role =
      record.role === "anonymous" ||
      record.role === "reader" ||
      record.role === "editor" ||
      record.role === "administrator"
        ? record.role
        : "editor";
    const scenario =
      record.scenario === "empty" ||
      record.scenario === "error" ||
      record.scenario === "forbidden" ||
      record.scenario === "populated"
        ? record.scenario
        : "populated";
    return { role, scenario };
  } catch {
    return { role: "editor", scenario: "populated" };
  }
}

export function MockEnvironmentProvider({ children }: { children: ReactNode }) {
  const enabled = isMockMode();
  const [state, setState] = useState(readStored);

  useEffect(() => {
    if (!enabled) return;
    publishMockRole(state.role);
    publishMockScenario(state.scenario);
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Persistence is optional; the in-memory choice still applies.
    }
  }, [enabled, state]);

  const value = useMemo<MockEnvironment>(
    () => ({
      enabled,
      role: state.role,
      scenario: state.scenario,
      setRole: (role) => setState((current) => ({ ...current, role })),
      setScenario: (scenario) => setState((current) => ({ ...current, scenario })),
    }),
    [enabled, state.role, state.scenario],
  );

  return (
    <MockEnvironmentContext.Provider value={value}>{children}</MockEnvironmentContext.Provider>
  );
}

export function useMockEnvironment(): MockEnvironment {
  return useContext(MockEnvironmentContext);
}
