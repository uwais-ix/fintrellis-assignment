package mu.uwais.fintrellis.posts.internal.web;

import java.time.Instant;
import java.util.UUID;

record PostResponse(
    UUID id,
    String title,
    String content,
    String authorSubject,
    String authorName,
    Instant createdAt,
    Instant updatedAt,
    long version) {}
