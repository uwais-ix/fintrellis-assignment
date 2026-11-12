package mu.uwais.fintrellis.posts.internal.web;

import java.time.Instant;
import java.util.UUID;
import mu.uwais.fintrellis.posts.internal.domain.Post;

record PostSummary(UUID id, String title, String excerpt, String authorName, Instant updatedAt) {
  static PostSummary from(Post post) {
    String text = post.getContent().replaceAll("\\s+", " ");
    int length = text.codePointCount(0, text.length());
    String excerpt = length > 180 ? text.substring(0, text.offsetByCodePoints(0, 180)) + "…" : text;
    return new PostSummary(
        post.getId(), post.getTitle(), excerpt, post.getAuthorName(), post.getUpdatedAt());
  }
}
