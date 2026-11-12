import { LogIn, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleLabels } from "../roles";
import { useSession } from "../session";

export function AccountMenu() {
  const session = useSession();

  if (session.status === "loading") {
    return <span className="text-xs text-muted-foreground">Checking session…</span>;
  }

  if (session.status === "anonymous") {
    return (
      <Button
        size="sm"
        onClick={session.signIn}
        disabled={!session.signInAvailable}
        title={session.signInAvailable ? undefined : "Sign-in is not configured"}
      >
        <LogIn aria-hidden="true" className="size-4" />
        Sign in
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-5 text-foreground">{session.name}</p>
        <div className="mt-1 flex justify-end gap-1">
          {session.roles.map((role) => (
            <Badge key={role}>{roleLabels[role]}</Badge>
          ))}
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={session.signOut}>
        <LogOut aria-hidden="true" className="size-4" />
        Sign out
      </Button>
    </div>
  );
}
