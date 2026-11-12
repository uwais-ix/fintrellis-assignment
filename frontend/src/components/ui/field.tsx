import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  counter?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Field({ id, label, description, error, counter, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <Label htmlFor={id}>{label}</Label>
        {counter ? (
          <span className="text-xs tabular-nums text-muted-foreground">{counter}</span>
        ) : null}
      </div>
      {children}
      {description && !error ? (
        <p id={`${id}-description`} className="text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
