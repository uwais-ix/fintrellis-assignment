package mu.uwais.fintrellis.posts.internal.application;

import java.time.Clock;
import java.util.UUID;
import mu.uwais.fintrellis.identity.CurrentActor;
import mu.uwais.fintrellis.posts.internal.domain.Post;
import mu.uwais.fintrellis.posts.internal.persistence.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PostService {
  private final PostRepository posts;
  private final CurrentActor currentActor;
  private final Clock clock;

  public PostService(PostRepository posts, CurrentActor currentActor, Clock clock) {
    this.posts = posts;
    this.currentActor = currentActor;
    this.clock = clock;
  }

  public Page<Post> list(int page, int size, String query) {
    var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt", "id"));
    String term = query.strip();
    return term.isEmpty() ? posts.findAll(pageable) : posts.search(term, pageable);
  }

  public Post get(UUID id) {
    return posts.findById(id).orElseThrow(PostNotFoundException::new);
  }

  @Transactional
  public Post create(String title, String content) {
    var actor = currentActor.require();
    return posts.saveAndFlush(
        Post.create(title, content, actor.subject(), actor.displayName(), clock.instant()));
  }

  @Transactional
  public Post update(UUID id, String title, String content, long version) {
    Post post = get(id);
    if (post.getVersion() != version) {
      throw new StalePostException();
    }
    post.revise(title, content, clock.instant());
    return posts.saveAndFlush(post);
  }

  @Transactional
  public void delete(UUID id) {
    posts.delete(get(id));
    posts.flush();
  }
}
