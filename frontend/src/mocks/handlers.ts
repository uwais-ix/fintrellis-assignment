import { delay, HttpResponse, http } from "msw";
import type { Post, PostPage, PostSummary } from "@/lib/api/types";
import { seedPosts } from "./fixtures";
import { getMockRole, getMockScenario } from "./scenario";

let posts: Post[] = seedPosts();

export function resetMockData() {
  posts = seedPosts();
}

function problem(
  status: number,
  title: string,
  detail: string,
  fieldErrors?: Record<string, string>,
) {
  return HttpResponse.json(
    {
      type: "about:blank",
      title,
      status,
      detail,
      instance: "urn:uuid:mock",
      requestId: `mock-${crypto.randomUUID().slice(0, 8)}`,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

function signedIn(): boolean {
  return getMockRole() !== "anonymous";
}

function mayWrite(): boolean {
  const role = getMockRole();
  return role === "editor" || role === "administrator";
}

function authorName(): string {
  return getMockRole() === "administrator" ? "Alex Administrator" : "Ellis Editor";
}

function summaryOf(post: Post): PostSummary {
  const normalized = post.content.replaceAll(/\s+/g, " ").trim();
  const excerpt = normalized.length > 180 ? `${normalized.slice(0, 180).trimEnd()}…` : normalized;
  return {
    id: post.id,
    title: post.title,
    excerpt,
    authorName: post.authorName,
    updatedAt: post.updatedAt,
  };
}

function fieldErrors(title: unknown, content: unknown): Record<string, string> {
  const errors: Record<string, string> = {};
  if (typeof title !== "string" || title.trim().length === 0) errors.title = "Enter a title.";
  else if (title.length > 160) errors.title = "Use at most 160 characters.";
  if (typeof content !== "string" || content.trim().length === 0)
    errors.content = "Write some content.";
  else if (content.length > 20000) errors.content = "Use at most 20,000 characters.";
  return errors;
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export const handlers = [
  http.get("/api/posts", async ({ request }) => {
    await delay(220);
    if (getMockScenario() === "error") {
      return problem(503, "Service unavailable", "The journal is temporarily unavailable.");
    }
    const url = new URL(request.url);
    const page = Math.max(0, Number(url.searchParams.get("page") ?? 0) || 0);
    const size = Math.min(30, Math.max(1, Number(url.searchParams.get("size") ?? 9) || 9));
    const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const matching = query
      ? posts.filter(
          (post) =>
            post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query),
        )
      : posts;
    const sorted = [...matching].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
    const start = page * size;
    const payload: PostPage = {
      items: sorted.slice(start, start + size).map(summaryOf),
      page,
      size,
      totalElements: sorted.length,
      totalPages: Math.ceil(sorted.length / size),
    };
    return getMockScenario() === "empty"
      ? HttpResponse.json({ ...payload, items: [], totalElements: 0, totalPages: 0 })
      : HttpResponse.json(payload);
  }),

  http.get("/api/posts/:id", async ({ params }) => {
    await delay(160);
    const post = posts.find((candidate) => candidate.id === params.id);
    if (!post) return problem(404, "Not found", "This post could not be found.");
    return HttpResponse.json(post);
  }),

  http.post("/api/posts", async ({ request }) => {
    await delay(260);
    if (!signedIn()) return problem(401, "Unauthorized", "Sign in to continue.");
    if (!mayWrite()) return problem(403, "Forbidden", "Your role does not allow this action.");
    const body = await readBody(request);
    const errors = fieldErrors(body.title, body.content);
    if (Object.keys(errors).length > 0)
      return problem(400, "Validation failed", "Check the highlighted fields.", errors);
    const now = new Date().toISOString();
    const post: Post = {
      id: crypto.randomUUID(),
      title: String(body.title).trim(),
      content: String(body.content).trim(),
      authorSubject: getMockRole(),
      authorName: authorName(),
      createdAt: now,
      updatedAt: now,
      version: 0,
    };
    posts = [post, ...posts];
    return HttpResponse.json(post, { status: 201, headers: { Location: `/api/posts/${post.id}` } });
  }),

  http.put("/api/posts/:id", async ({ params, request }) => {
    await delay(260);
    if (!signedIn()) return problem(401, "Unauthorized", "Sign in to continue.");
    if (!mayWrite()) return problem(403, "Forbidden", "Your role does not allow this action.");
    const post = posts.find((candidate) => candidate.id === params.id);
    if (!post) return problem(404, "Not found", "This post could not be found.");
    const body = await readBody(request);
    const errors = fieldErrors(body.title, body.content);
    if (Object.keys(errors).length > 0)
      return problem(400, "Validation failed", "Check the highlighted fields.", errors);
    if (typeof body.version !== "number" || body.version !== post.version) {
      return problem(
        409,
        "Conflict",
        "This post has changed since you opened it. Reload it before saving again.",
      );
    }
    const now = new Date().toISOString();
    const updated: Post = {
      ...post,
      title: String(body.title).trim(),
      content: String(body.content).trim(),
      updatedAt: now,
      version: post.version + 1,
    };
    posts = posts.map((candidate) => (candidate.id === post.id ? updated : candidate));
    return HttpResponse.json(updated);
  }),

  http.delete("/api/posts/:id", async ({ params }) => {
    await delay(220);
    if (!signedIn()) return problem(401, "Unauthorized", "Sign in to continue.");
    if (getMockRole() !== "administrator" || getMockScenario() === "forbidden") {
      return problem(403, "Forbidden", "Only administrators can delete posts.");
    }
    const exists = posts.some((candidate) => candidate.id === params.id);
    if (!exists) return problem(404, "Not found", "This post could not be found.");
    posts = posts.filter((candidate) => candidate.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
