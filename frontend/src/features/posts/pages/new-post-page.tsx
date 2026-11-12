import { useState } from "react";
import { useNavigate } from "react-router";
import { useSession } from "@/features/auth/session";
import { ApiProblem } from "@/lib/api/client";
import { PostForm } from "../components/post-form";
import { useCreatePost } from "../hooks/use-post-mutations";
import type { PostFormValues } from "../schemas/post-form";

export function NewPostPage() {
  const session = useSession();
  const navigate = useNavigate();
  const create = useCreatePost();
  const [problem, setProblem] = useState<ApiProblem | null>(null);

  function submit(values: PostFormValues) {
    setProblem(null);
    create.mutate(values, {
      onSuccess: (post) =>
        navigate(`/posts/${post.id}`, { replace: true, state: { notice: "Note published." } }),
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
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">New note</p>
        <h1 className="text-balance font-serif text-4xl font-medium leading-tight text-foreground">
          Write something worth keeping.
        </h1>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          You will appear as {session.name}. Keep it concise; a clear idea is more useful than a
          long one.
        </p>
      </header>
      <PostForm
        submitLabel="Publish note"
        pending={create.isPending}
        problem={problem}
        onSubmit={submit}
        onCancel={() => navigate("/")}
      />
    </div>
  );
}
