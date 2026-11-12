package mu.uwais.fintrellis.posts.internal.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import mu.uwais.fintrellis.posts.internal.domain.Post;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class PostWebMapperTest {
  private static final Instant CREATED_AT = Instant.parse("2026-01-01T10:00:00Z");

  private final PostWebMapper mapper = Mappers.getMapper(PostWebMapper.class);

  @Test
  void mapsEveryResponseField() {
    Post post = Post.create("A title", "A body", "editor-1", "Ellis Editor", CREATED_AT);

    PostResponse response = mapper.toResponse(post);

    assertThat(response.id()).isEqualTo(post.getId());
    assertThat(response.title()).isEqualTo("A title");
    assertThat(response.content()).isEqualTo("A body");
    assertThat(response.authorSubject()).isEqualTo("editor-1");
    assertThat(response.authorName()).isEqualTo("Ellis Editor");
    assertThat(response.createdAt()).isEqualTo(CREATED_AT);
    assertThat(response.updatedAt()).isEqualTo(CREATED_AT);
    assertThat(response.version()).isZero();
  }

  @Test
  void collapsesWhitespaceAndShortensLongExcerpts() {
    Post post =
        Post.create(
            "A title", "First paragraph.\n\nSecond paragraph.", "editor-1", "Ellis", CREATED_AT);
    Post longPost = Post.create("A title", "x".repeat(200), "editor-1", "Ellis", CREATED_AT);

    assertThat(mapper.toSummary(post).excerpt()).isEqualTo("First paragraph. Second paragraph.");
    assertThat(mapper.toSummary(longPost).excerpt()).hasSize(181).endsWith("…");
  }

  @Test
  void mapsPageMetadataAndItems() {
    Post post = Post.create("A title", "A body", "editor-1", "Ellis", CREATED_AT);
    var page = new PageImpl<>(List.of(post), PageRequest.of(0, 9), 1);

    PostPage result = mapper.toPage(page);

    assertThat(result.items()).singleElement().extracting(PostSummary::title).isEqualTo("A title");
    assertThat(result.page()).isZero();
    assertThat(result.size()).isEqualTo(9);
    assertThat(result.totalElements()).isEqualTo(1);
    assertThat(result.totalPages()).isEqualTo(1);
  }
}
