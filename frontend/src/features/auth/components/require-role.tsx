import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "../session";

type Permission = "canCreate" | "canEdit" | "canDelete";

export function RequireRole({ allow, children }: { allow: Permission; children: ReactNode }) {
  const session = useSession();

  if (session.status === "loading") {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner label="Checking your access" />
      </div>
    );
  }

  if (session.status === "anonymous") {
    return (
      <Card className="mx-auto mt-12 max-w-xl p-8 text-center">
        <h1 className="font-serif text-3xl font-medium text-foreground">Sign in to continue</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Writing and editing are limited to invited members of the journal.
        </p>
        {session.error ? <p className="mt-3 text-sm text-destructive">{session.error}</p> : null}
        <Button className="mt-6" onClick={session.signIn} disabled={!session.signInAvailable}>
          Sign in
        </Button>
      </Card>
    );
  }

  if (!session[allow]) {
    return (
      <Card className="mx-auto mt-12 max-w-xl p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">403</p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-foreground">
          Your role cannot do that
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          You are signed in as {session.name}. Ask an administrator if you need a different role.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Back to the journal</Link>
        </Button>
      </Card>
    );
  }

  return <>{children}</>;
}
