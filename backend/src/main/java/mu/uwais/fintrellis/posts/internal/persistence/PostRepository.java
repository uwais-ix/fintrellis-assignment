package mu.uwais.fintrellis.posts.internal.persistence;

import java.util.UUID;
import mu.uwais.fintrellis.posts.internal.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, UUID> {
  @Query(
      "select p from Post p where locate(lower(:query), lower(p.title)) > 0 "
          + "or locate(lower(:query), lower(p.content)) > 0")
  Page<Post> search(@Param("query") String query, Pageable pageable);
}
