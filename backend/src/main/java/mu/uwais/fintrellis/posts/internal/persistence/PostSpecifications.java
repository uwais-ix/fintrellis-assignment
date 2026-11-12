package mu.uwais.fintrellis.posts.internal.persistence;

import jakarta.persistence.criteria.Path;
import java.util.Locale;
import mu.uwais.fintrellis.posts.internal.domain.Post;
import org.springframework.data.jpa.domain.Specification;

public final class PostSpecifications {
  private static final char ESCAPE = '\\';

  private PostSpecifications() {}

  public static Specification<Post> matching(String term) {
    if (term == null || term.isBlank()) return Specification.unrestricted();

    String pattern = "%" + escapeLike(term.strip().toLowerCase(Locale.ROOT)) + "%";
    return (root, query, builder) -> {
      Path<String> title = root.get("title");
      Path<String> content = root.get("content");
      return builder.or(
          builder.like(builder.lower(title), pattern, ESCAPE),
          builder.like(builder.lower(content), pattern, ESCAPE));
    };
  }

  private static String escapeLike(String value) {
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
  }
}
