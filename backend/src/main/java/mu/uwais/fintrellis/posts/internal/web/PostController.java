package mu.uwais.fintrellis.posts.internal.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.util.UUID;
import mu.uwais.fintrellis.posts.internal.application.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
class PostController {
  private final PostService posts;
  private final PostWebMapper mapper;

  PostController(PostService posts, PostWebMapper mapper) {
    this.posts = posts;
    this.mapper = mapper;
  }

  @GetMapping
  PostPage list(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "9") @Min(1) @Max(30) int size,
      @RequestParam(defaultValue = "") @Size(max = 100) String q) {
    return mapper.toPage(posts.list(page, size, q));
  }

  @GetMapping("/{id}")
  PostResponse get(@PathVariable UUID id) {
    return mapper.toResponse(posts.get(id));
  }

  @PostMapping
  ResponseEntity<PostResponse> create(@Valid @RequestBody CreatePostRequest request) {
    var post = posts.create(request.title(), request.content());
    return ResponseEntity.created(URI.create("/api/posts/" + post.getId()))
        .body(mapper.toResponse(post));
  }

  @PutMapping("/{id}")
  PostResponse update(@PathVariable UUID id, @Valid @RequestBody UpdatePostRequest request) {
    return mapper.toResponse(
        posts.update(id, request.title(), request.content(), request.version()));
  }

  @DeleteMapping("/{id}")
  ResponseEntity<Void> delete(@PathVariable UUID id) {
    posts.delete(id);
    return ResponseEntity.noContent().build();
  }
}
