package mu.uwais.fintrellis.posts.internal.persistence;

import java.util.UUID;
import mu.uwais.fintrellis.posts.internal.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PostRepository extends JpaRepository<Post, UUID>, JpaSpecificationExecutor<Post> {}
