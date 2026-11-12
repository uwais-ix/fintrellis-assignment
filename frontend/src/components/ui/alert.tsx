import { CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends ComponentProps<"div"> {
  title: string;
  children: ReactNode;
}

export function Alert({ className, title, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm",
        className,
      )}
      {...props}
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">{title}</p>
        <div className="leading-6 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
