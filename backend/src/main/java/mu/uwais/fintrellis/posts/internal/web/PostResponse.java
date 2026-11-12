package mu.uwais.fintrellis.posts.internal.web;

import java.time.Instant;
import java.util.UUID;
import mu.uwais.fintrellis.posts.internal.domain.Post;

record PostResponse(
    UUID id,
    String title,
    String content,
    String authorSubject,
    String authorName,
    Instant createdAt,
    Instant updatedAt,
    long version) {
  static PostResponse from(Post post) {
    return new PostResponse(
        post.getId(),
        post.getTitle(),
        post.getContent(),
        post.getAuthorSubject(),
        post.getAuthorName(),
        post.getCreatedAt(),
        post.getUpdatedAt(),
        post.getVersion());
  }
}
