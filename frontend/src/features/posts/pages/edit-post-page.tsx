import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiProblem } from "@/lib/api/client";
import { postQueryOptions } from "../api/posts";
import { PostForm } from "../components/post-form";
import { useUpdatePost } from "../hooks/use-post-mutations";
import type { PostFormValues } from "../schemas/post-form";

export function EditPostPage() {
  const { postId = "" } = useParams();
  const navigate = useNavigate();
  const post = useQuery({ ...postQueryOptions(postId), enabled: Boolean(postId) });
  const update = useUpdatePost(postId);
  const [problem, setProblem] = useState<ApiProblem | null>(null);
  const [formKey, setFormKey] = useState(0);

  if (post.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner label="Loading note" />
      </div>
    );
  }

  if (post.error instanceof ApiProblem || !post.data) {
    const current = post.error instanceof ApiProblem ? post.error : null;
    return (
      <div className="mx-auto mt-8 max-w-2xl">
        <Alert title={current?.title ?? "Unable to load this note"}>
          <p>{current?.detail ?? "The note could not be loaded."}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void post.refetch()}>
            Try again
          </Button>
        </Alert>
      </div>
    );
  }

  const article = post.data;

  function submit(values: PostFormValues) {
    setProblem(null);
    update.mutate(
      { ...values, version: article.version },
      {
        onSuccess: () =>
          navigate(`/posts/${article.id}`, {
            replace: true,
            state: { notice: "Changes saved." },
          }),
        onError: (error) =>
          setProblem(
            error instanceof ApiProblem
              ? error
              : new ApiProblem({
                  status: 0,
                  title: "Unable to save",
                  detail: "The note could not be saved.",
                }),
          ),
      },
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <Link
          to={`/posts/${article.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to the note
        </Link>
        <h1 className="text-balance font-serif text-4xl font-medium leading-tight text-foreground">
          Edit note
        </h1>
        <p className="text-sm text-muted-foreground">
          Version {article.version + 1} · last updated by {article.authorName}
        </p>
      </header>
      <PostForm
        key={formKey}
        defaultValues={{ title: article.title, content: article.content }}
        submitLabel="Save changes"
        pending={update.isPending}
        problem={problem}
        onSubmit={submit}
        onCancel={() => navigate(`/posts/${article.id}`)}
        onReload={() => {
          setProblem(null);
          void post.refetch().then(() => setFormKey((current) => current + 1));
        }}
      />
    </div>
  );
}
