package mu.uwais.fintrellis.posts.internal.web;

import jakarta.servlet.http.HttpServletRequest;
import mu.uwais.fintrellis.posts.internal.application.PostNotFoundException;
import mu.uwais.fintrellis.posts.internal.application.StalePostException;
import mu.uwais.fintrellis.web.ProblemResponses;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = PostController.class)
@Order(0)
class PostExceptionHandler {
  private final ProblemResponses problems;

  PostExceptionHandler(ProblemResponses problems) {
    this.problems = problems;
  }

  @ExceptionHandler(PostNotFoundException.class)
  ProblemDetail notFound(PostNotFoundException exception, HttpServletRequest request) {
    return problems.create(request, HttpStatus.NOT_FOUND, exception.getMessage());
  }

  @ExceptionHandler({StalePostException.class, ObjectOptimisticLockingFailureException.class})
  ProblemDetail conflict(HttpServletRequest request) {
    return problems.create(request, HttpStatus.CONFLICT, new StalePostException().getMessage());
  }
}
