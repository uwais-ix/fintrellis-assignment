import { useQuery } from "@tanstack/react-query";
import { PenLine, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/session";
import { ApiProblem } from "@/lib/api/client";
import { postsQueryOptions } from "../api/posts";
import { PostCard } from "../components/post-card";

const pageSize = 9;

interface LocationState {
  notice?: string;
}

export function PostsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const pageValue = Number(searchParams.get("page") ?? "0");
  const page = Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 0;
  const query = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState(query);

  useEffect(() => setDraft(query), [query]);

  const posts = useQuery(postsQueryOptions({ page, size: pageSize, query }));
  const notice = (location.state as LocationState | null)?.notice;
  const problem = posts.error instanceof ApiProblem ? posts.error : null;
  const totalElements = posts.data?.totalElements ?? 0;

  function submitSearch(term: string) {
    const next = new URLSearchParams(searchParams);
    if (term.trim()) next.set("q", term.trim());
    else next.delete("q");
    next.delete("page");
    setSearchParams(next);
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  }

  function dismissNotice() {
    navigate(location.pathname, { replace: true, state: null });
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6 border-b border-border pb-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Shared editorial workspace
            </p>
            <h1 className="mt-3 text-balance font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
              Notes worth keeping.
            </h1>
            <p className="mt-4 max-w-xl text-pretty leading-7 text-muted-foreground">
              Short, useful writing from the people building the product. Read openly; writing is
              limited to invited members.
            </p>
          </div>
          {session.canCreate ? (
            <Button asChild size="lg">
              <Link to="/posts/new">
                <PenLine aria-hidden="true" className="size-4" />
                Write a note
              </Link>
            </Button>
          ) : null}
        </div>

        <form
          className="flex max-w-xl flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(draft);
          }}
        >
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-9"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Search titles and content"
              aria-label="Search notes"
              maxLength={100}
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
          {query ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDraft("");
                submitSearch("");
              }}
            >
              Clear
            </Button>
          ) : null}
        </form>
      </section>

      {notice ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground"
        >
          <span>{notice}</span>
          <Button variant="ghost" size="sm" onClick={dismissNotice}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {problem ? (
        <Alert title={problem.title}>
          <p>{problem.detail}</p>
          {problem.requestId ? (
            <p className="mt-1 font-mono text-xs">Reference: {problem.requestId}</p>
          ) : null}
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void posts.refetch()}>
            Try again
          </Button>
        </Alert>
      ) : null}

      {posts.isPending ? (
        <div
          className="grid gap-6 sm:grid-cols-2"
          role="status"
          aria-busy="true"
          aria-label="Loading notes"
        >
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border border-border p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-5 h-8 w-3/4" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : posts.data && posts.data.items.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.data.items.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                featured={page === 0 && index === 0}
              />
            ))}
          </div>
          <nav
            aria-label="Pagination"
            className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"
          >
            <p className="text-sm text-muted-foreground">
              Page {posts.data.page + 1} of {Math.max(posts.data.totalPages, 1)} ·{" "}
              {posts.data.totalElements} note{posts.data.totalElements === 1 ? "" : "s"}
              {posts.isFetching ? " · updating" : ""}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => goToPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= posts.data.totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </nav>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <Badge>Empty</Badge>
          <h2 className="mt-4 font-serif text-3xl font-medium text-foreground">
            {query
              ? "No notes match that search"
              : totalElements > 0
                ? "This page has no notes"
                : "The journal is waiting for its first note"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            {query
              ? "Try a shorter phrase, or clear the search to see every note."
              : totalElements > 0
                ? "The page number is beyond the end of the journal."
                : "Start with something small: a decision, an observation, or a lesson worth sharing."}
          </p>
          {query ? (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setDraft("");
                submitSearch("");
              }}
            >
              Clear search
            </Button>
          ) : totalElements > 0 ? (
            <Button variant="outline" className="mt-6" onClick={() => goToPage(0)}>
              Back to the first page
            </Button>
          ) : session.canCreate ? (
            <Button asChild className="mt-6">
              <Link to="/posts/new">Write the first note</Link>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
