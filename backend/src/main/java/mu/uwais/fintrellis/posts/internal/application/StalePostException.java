package mu.uwais.fintrellis.posts.internal.application;

public class StalePostException extends RuntimeException {
  public StalePostException() {
    super("This post has changed since you opened it. Reload it before saving again.");
  }
}
