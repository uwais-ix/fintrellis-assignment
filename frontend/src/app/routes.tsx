import { Route, Routes } from "react-router";
import { CallbackPage } from "@/features/auth/components/callback-page";
import { RequireRole } from "@/features/auth/components/require-role";
import { EditPostPage } from "@/features/posts/pages/edit-post-page";
import { NewPostPage } from "@/features/posts/pages/new-post-page";
import { PostPage } from "@/features/posts/pages/post-page";
import { PostsPage } from "@/features/posts/pages/posts-page";
import { AppShell } from "./app-shell";
import { NotFoundPage } from "./not-found-page";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<PostsPage />} />
        <Route
          path="posts/new"
          element={
            <RequireRole allow="canCreate">
              <NewPostPage />
            </RequireRole>
          }
        />
        <Route path="posts/:postId" element={<PostPage />} />
        <Route
          path="posts/:postId/edit"
          element={
            <RequireRole allow="canEdit">
              <EditPostPage />
            </RequireRole>
          }
        />
        <Route path="auth/callback" element={<CallbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
