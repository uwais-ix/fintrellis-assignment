import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "../session";

export function CallbackPage() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session.status === "authenticated") navigate("/", { replace: true });
  }, [session.status, navigate]);

  if (session.status === "anonymous") {
    return (
      <Card className="mx-auto mt-12 max-w-lg p-8 text-center">
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Sign-in did not complete
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Return to the journal and try again. If the problem continues, ask an administrator to
          check the identity provider configuration.
        </p>
        <a href="/" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Return to the journal
        </a>
      </Card>
    );
  }

  return (
    <div className="flex min-h-64 items-center justify-center">
      <Spinner label="Completing sign-in" />
    </div>
  );
}
