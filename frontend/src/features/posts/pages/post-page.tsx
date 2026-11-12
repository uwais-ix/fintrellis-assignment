import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PenLine } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/features/auth/session";
import { ApiProblem } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { postQueryOptions } from "../api/posts";
import { DeletePostDialog } from "../components/delete-post-dialog";
import { useDeletePost } from "../hooks/use-post-mutations";

export function PostPage() {
  const { postId = "" } = useParams();
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const post = useQuery({ ...postQueryOptions(postId), enabled: Boolean(postId) });
  const remove = useDeletePost(postId);
  const notice = (location.state as { notice?: string } | null)?.notice;

  if (post.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner label="Loading note" />
      </div>
    );
  }

  const problem = post.error instanceof ApiProblem ? post.error : null;

  if (problem?.status === 404) {
    return (
      <Card className="mx-auto mt-12 max-w-xl p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-foreground">
          This note is no longer here
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          It may have been deleted, or the link may be incomplete.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Back to the journal</Link>
        </Button>
      </Card>
    );
  }

  if (problem || !post.data) {
    return (
      <div className="mx-auto mt-8 max-w-2xl">
        <Alert title={problem?.title ?? "Unable to load this note"}>
          <p>{problem?.detail ?? "The note could not be loaded."}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void post.refetch()}>
            Try again
          </Button>
        </Alert>
      </div>
    );
  }

  const article = post.data;

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All notes
        </Link>
        <div className="flex items-center gap-2">
          {session.canEdit ? (
            <Button asChild variant="outline" size="sm">
              <Link to={`/posts/${article.id}/edit`}>
                <PenLine aria-hidden="true" className="size-4" />
                Edit
              </Link>
            </Button>
          ) : null}
          {session.canDelete ? (
            <DeletePostDialog
              title={article.title}
              pending={remove.isPending}
              onConfirm={() => {
                remove.mutate(undefined, {
                  onSuccess: () =>
                    navigate("/", { state: { notice: "Note deleted." }, replace: true }),
                });
              }}
            />
          ) : null}
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground"
        >
          {notice}
        </p>
      ) : null}

      {remove.error instanceof ApiProblem ? (
        <Alert title={remove.error.title}>
          <p>{remove.error.detail}</p>
        </Alert>
      ) : null}

      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <div className="flex items-center gap-3">
          <Badge>Note</Badge>
          <span className="text-xs text-muted-foreground">
            Updated <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
          </span>
        </div>
        <h1 className="text-balance font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {article.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          By {article.authorName} · Created {formatDate(article.createdAt)}
        </p>
      </header>

      <div className="whitespace-pre-wrap text-pretty text-lg leading-8 text-foreground/90">
        {article.content}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
        <span>Thanks for reading.</span>
        <Button asChild variant="ghost" size="sm">
          <Link to="/">Back to all notes</Link>
        </Button>
      </footer>
    </article>
  );
}
