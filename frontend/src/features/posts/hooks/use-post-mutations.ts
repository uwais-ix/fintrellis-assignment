import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePost, UpdatePost } from "@/lib/api/types";
import { createPost, deletePost, postKeys, updatePost } from "../api/posts";

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePost) => createPost(input),
    onSuccess: async (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post);
      await queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useUpdatePost(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePost) => updatePost(id, input),
    onSuccess: async (post) => {
      queryClient.setQueryData(postKeys.detail(post.id), post);
      await queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useDeletePost(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
