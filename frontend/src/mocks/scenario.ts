export type MockScenario = "populated" | "empty" | "error" | "forbidden";

export type MockRole = "anonymous" | "reader" | "editor" | "administrator";

let scenario: MockScenario = "populated";
let role: MockRole = "editor";

export function getMockScenario(): MockScenario {
  return scenario;
}

export function setMockScenario(next: MockScenario) {
  scenario = next;
}

export function getMockRole(): MockRole {
  return role;
}

export function setMockRole(next: MockRole) {
  role = next;
}

export function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCKS === "true";
}
