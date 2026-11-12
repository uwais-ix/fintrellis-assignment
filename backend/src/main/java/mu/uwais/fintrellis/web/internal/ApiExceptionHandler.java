package mu.uwais.fintrellis.web.internal;

import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mu.uwais.fintrellis.web.ProblemResponses;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
@Order(1)
@RequiredArgsConstructor
@Slf4j
class ApiExceptionHandler extends ResponseEntityExceptionHandler {
  private final ProblemResponses problems;

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException exception,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(status, "Check the highlighted fields.");
    Map<String, String> errors = new LinkedHashMap<>();
    exception
        .getBindingResult()
        .getFieldErrors()
        .forEach(
            error ->
                errors.putIfAbsent(
                    error.getField(),
                    error.getDefaultMessage() == null
                        ? "Invalid value."
                        : error.getDefaultMessage()));
    problem.setProperty("fieldErrors", errors);
    return handleExceptionInternal(exception, problem, headers, status, request);
  }

  @Override
  protected ResponseEntity<Object> handleExceptionInternal(
      Exception exception,
      Object body,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    ProblemDetail problem =
        body instanceof ProblemDetail detail
            ? detail
            : ProblemDetail.forStatusAndDetail(
                status,
                status.is5xxServerError()
                    ? "Something went wrong. Try again shortly."
                    : "The request could not be processed. Check its values.");
    if (request instanceof ServletWebRequest servletRequest) {
      problems.enrich(servletRequest.getRequest(), problem);
    }
    return super.handleExceptionInternal(exception, problem, headers, status, request);
  }

  @ExceptionHandler(Exception.class)
  ProblemDetail unexpected(Exception exception, HttpServletRequest request) {
    log.error(
        "Unexpected request failure requestId={}", request.getAttribute("requestId"), exception);
    return problems.create(
        request, HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Try again shortly.");
  }
}
