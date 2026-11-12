import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api/client";
import type { CreatePost, Post, PostPage, UpdatePost } from "@/lib/api/types";

export interface PostListParams {
  page: number;
  size: number;
  query: string;
}

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (params: PostListParams) => [...postKeys.lists(), params] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

export function listPosts(params: PostListParams, signal?: AbortSignal): Promise<PostPage> {
  const search = new URLSearchParams({ page: String(params.page), size: String(params.size) });
  if (params.query.trim()) search.set("q", params.query.trim());
  return request<PostPage>(`/posts?${search.toString()}`, { signal });
}

export function getPost(id: string, signal?: AbortSignal): Promise<Post> {
  return request<Post>(`/posts/${id}`, { signal });
}

export function createPost(input: CreatePost): Promise<Post> {
  return request<Post>("/posts", { method: "POST", body: input });
}

export function updatePost(id: string, input: UpdatePost): Promise<Post> {
  return request<Post>(`/posts/${id}`, { method: "PUT", body: input });
}

export function deletePost(id: string): Promise<void> {
  return request<void>(`/posts/${id}`, { method: "DELETE" });
}

export function postsQueryOptions(params: PostListParams) {
  return queryOptions({
    queryKey: postKeys.list(params),
    queryFn: ({ signal }) => listPosts(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function postQueryOptions(id: string) {
  return queryOptions({
    queryKey: postKeys.detail(id),
    queryFn: ({ signal }) => getPost(id, signal),
  });
}
