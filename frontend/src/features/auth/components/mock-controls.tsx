import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MockRole, MockScenario } from "@/mocks/scenario";
import { useMockEnvironment } from "../mock-environment";

const roleOptions: { value: MockRole; label: string }[] = [
  { value: "anonymous", label: "Signed out" },
  { value: "reader", label: "Reader" },
  { value: "editor", label: "Editor" },
  { value: "administrator", label: "Administrator" },
];

const scenarioOptions: { value: MockScenario; label: string }[] = [
  { value: "populated", label: "Populated" },
  { value: "empty", label: "Empty list" },
  { value: "error", label: "Service error" },
  { value: "forbidden", label: "Forbidden delete" },
];

const selectClass =
  "h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function MockControls() {
  const { enabled, role, scenario, setRole, setScenario } = useMockEnvironment();
  if (!enabled) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border px-2 py-1.5">
      <Badge className="gap-1 border-primary/30 bg-primary/10 text-primary">
        <FlaskConical aria-hidden="true" className="size-3" />
        Mock data
      </Badge>
      <label className="sr-only" htmlFor="mock-role">
        Preview role
      </label>
      <select
        id="mock-role"
        className={selectClass}
        value={role}
        onChange={(event) => setRole(event.target.value as MockRole)}
      >
        {roleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="mock-scenario">
        Preview scenario
      </label>
      <select
        id="mock-scenario"
        className={selectClass}
        value={scenario}
        onChange={(event) => setScenario(event.target.value as MockScenario)}
      >
        {scenarioOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
