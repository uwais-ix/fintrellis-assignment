import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends Omit<ComponentProps<"label">, "htmlFor"> {
  htmlFor: string;
}

export function Label({ className, htmlFor, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the label is associated through the required htmlFor prop
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
