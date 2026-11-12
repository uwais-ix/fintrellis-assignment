package mu.uwais.fintrellis.posts.internal.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import java.time.Instant;
import org.junit.jupiter.api.Test;

class PostTest {
  private static final Instant CREATED_AT = Instant.parse("2026-01-01T10:00:00Z");

  @Test
  void creationTrimsContentAndRecordsAuthorship() {
    Post post = Post.create("  A useful idea  ", "  Write it down.  ", "user-1", "Ada", CREATED_AT);

    assertThat(post.getId()).isNotNull();
    assertThat(post.getTitle()).isEqualTo("A useful idea");
    assertThat(post.getContent()).isEqualTo("Write it down.");
    assertThat(post.getAuthorSubject()).isEqualTo("user-1");
    assertThat(post.getAuthorName()).isEqualTo("Ada");
    assertThat(post.getCreatedAt()).isEqualTo(CREATED_AT);
    assertThat(post.getUpdatedAt()).isEqualTo(CREATED_AT);
  }

  @Test
  void revisionPreservesOriginalAuthorAndCreationTime() {
    Post post = Post.create("First title", "First body", "user-1", "Ada", CREATED_AT);
    Instant revisedAt = CREATED_AT.plusSeconds(60);

    post.revise("New title", "New body", revisedAt);

    assertThat(post.getTitle()).isEqualTo("New title");
    assertThat(post.getContent()).isEqualTo("New body");
    assertThat(post.getAuthorSubject()).isEqualTo("user-1");
    assertThat(post.getCreatedAt()).isEqualTo(CREATED_AT);
    assertThat(post.getUpdatedAt()).isEqualTo(revisedAt);
  }

  @Test
  void blankTitlesAreRejected() {
    assertThatIllegalArgumentException()
        .isThrownBy(() -> Post.create(" \n ", "Body", "user-1", "Ada", CREATED_AT));
  }

  @Test
  void oversizedContentIsRejected() {
    assertThatIllegalArgumentException()
        .isThrownBy(() -> Post.create("Title", "x".repeat(20_001), "user-1", "Ada", CREATED_AT));
  }

  @Test
  void invalidRevisionDoesNotPartiallyChangeThePost() {
    Post post = Post.create("Original", "Body", "user-1", "Ada", CREATED_AT);

    assertThatIllegalArgumentException()
        .isThrownBy(() -> post.revise("Changed", " ", CREATED_AT.plusSeconds(60)));

    assertThat(post.getTitle()).isEqualTo("Original");
    assertThat(post.getContent()).isEqualTo("Body");
  }
}
