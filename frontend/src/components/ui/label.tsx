import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: ComponentProps<"label">) {
  // biome-ignore lint/a11y/noLabelWithoutControl: callers pass htmlFor to associate the label
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}
