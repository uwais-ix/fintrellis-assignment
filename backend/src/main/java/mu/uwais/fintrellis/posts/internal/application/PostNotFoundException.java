package mu.uwais.fintrellis.posts.internal.application;

public class PostNotFoundException extends RuntimeException {
  public PostNotFoundException() {
    super("This post could not be found.");
  }
}
