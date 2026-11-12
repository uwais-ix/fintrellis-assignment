package mu.uwais.fintrellis.posts.internal.web;

import java.util.List;
import mu.uwais.fintrellis.posts.internal.domain.Post;
import org.springframework.data.domain.Page;

record PostPage(List<PostSummary> items, int page, int size, long totalElements, int totalPages) {
  static PostPage from(Page<Post> posts) {
    return new PostPage(
        posts.map(PostSummary::from).getContent(),
        posts.getNumber(),
        posts.getSize(),
        posts.getTotalElements(),
        posts.getTotalPages());
  }
}
