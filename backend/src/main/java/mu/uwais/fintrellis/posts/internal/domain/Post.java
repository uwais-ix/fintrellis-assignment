package mu.uwais.fintrellis.posts.internal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post {
  @Id private UUID id;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(nullable = false, columnDefinition = "text")
  private String content;

  @Column(nullable = false, updatable = false)
  private String authorSubject;

  @Column(nullable = false, updatable = false)
  private String authorName;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @Column(nullable = false)
  private Instant updatedAt;

  @Version private long version;

  public static Post create(
      String title, String content, String authorSubject, String authorName, Instant now) {
    Post post = new Post();
    post.id = UUID.randomUUID();
    post.authorSubject = Objects.requireNonNull(authorSubject);
    post.authorName = Objects.requireNonNull(authorName);
    post.createdAt = Objects.requireNonNull(now);
    post.revise(title, content, now);
    return post;
  }

  public void revise(String title, String content, Instant now) {
    String validTitle = requireText(title, 160, "Title");
    String validContent = requireText(content, 20_000, "Content");
    this.title = validTitle;
    this.content = validContent;
    this.updatedAt = Objects.requireNonNull(now);
  }

  private static String requireText(String value, int maximumLength, String field) {
    if (value == null || value.isBlank() || value.length() > maximumLength) {
      throw new IllegalArgumentException(
          field + " must contain 1 to " + maximumLength + " characters");
    }
    return value.strip();
  }
}
