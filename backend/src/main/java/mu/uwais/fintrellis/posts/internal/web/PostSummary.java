package mu.uwais.fintrellis.posts.internal.web;

import java.time.Instant;
import java.util.UUID;

record PostSummary(UUID id, String title, String excerpt, String authorName, Instant updatedAt) {}
