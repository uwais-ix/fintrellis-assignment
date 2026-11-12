import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { ApiProblem } from "@/lib/api/client";
import { type PostFormValues, postFormSchema } from "../schemas/post-form";

interface PostFormProps {
  defaultValues?: PostFormValues;
  submitLabel: string;
  pending: boolean;
  problem: ApiProblem | null;
  onSubmit: (values: PostFormValues) => void;
  onCancel: () => void;
  onReload?: () => void;
}

export function PostForm({
  defaultValues,
  submitLabel,
  pending,
  problem,
  onSubmit,
  onCancel,
  onReload,
}: PostFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: defaultValues ?? { title: "", content: "" },
  });

  useEffect(() => {
    if (!problem) return;
    for (const [field, message] of Object.entries(problem.fieldErrors)) {
      if (field === "title" || field === "content") setError(field, { message });
    }
  }, [problem, setError]);

  const title = watch("title") ?? "";
  const content = watch("content") ?? "";

  return (
    <form
      className="flex flex-col gap-6"
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      {problem ? (
        <Alert title={problem.title}>
          <p>{problem.detail}</p>
          {problem.requestId ? (
            <p className="mt-1 font-mono text-xs">Reference: {problem.requestId}</p>
          ) : null}
          {problem.status === 409 && onReload ? (
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onReload}>
              Reload the latest version
            </Button>
          ) : null}
        </Alert>
      ) : null}

      <Field
        id="title"
        label="Title"
        description="A clear title helps people find this note later."
        error={errors.title?.message}
        counter={`${title.length}/160`}
      >
        <Input
          id="title"
          autoFocus
          maxLength={160}
          placeholder="A useful idea"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : "title-description"}
          {...register("title")}
        />
      </Field>

      <Field
        id="content"
        label="Content"
        description="Plain text. Leave a blank line between paragraphs."
        error={errors.content?.message}
        counter={`${content.length.toLocaleString()}/20,000`}
      >
        <Textarea
          id="content"
          rows={14}
          maxLength={20000}
          placeholder="Write the note in your own words…"
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? "content-error" : "content-description"}
          {...register("content")}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner label="Saving" /> : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
