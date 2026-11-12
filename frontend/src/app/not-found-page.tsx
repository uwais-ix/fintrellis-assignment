import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <Card className="mx-auto mt-12 max-w-xl p-8 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-foreground">Page not found</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        The page you asked for does not exist. Return to the journal to keep reading.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Back to the journal</Link>
      </Button>
    </Card>
  );
}
