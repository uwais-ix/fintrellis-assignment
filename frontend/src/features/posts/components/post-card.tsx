import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import type { PostSummary } from "@/lib/api/types";
import { formatRelativeDate } from "@/lib/format";

interface PostCardProps {
  post: PostSummary;
  featured?: boolean;
  index?: number;
}

export function PostCard({ post, featured = false, index = 0 }: PostCardProps) {
  return (
    <article
      className={`animate-rise group flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40 ${
        featured ? "sm:col-span-2 sm:p-9" : ""
      }`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Badge>Note</Badge>
        <time dateTime={post.updatedAt}>{formatRelativeDate(post.updatedAt)}</time>
      </div>
      <h2
        className={`text-balance font-serif font-medium leading-tight text-foreground ${
          featured ? "text-3xl sm:text-4xl" : "text-2xl"
        }`}
      >
        <Link to={`/posts/${post.id}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h2>
      <p
        className={`text-pretty leading-7 text-muted-foreground ${featured ? "text-base" : "text-sm"}`}
      >
        {post.excerpt}
      </p>
      <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <span>{post.authorName}</span>
        <Link to={`/posts/${post.id}`} className="font-medium text-primary hover:underline">
          Read note
        </Link>
      </div>
    </article>
  );
}
