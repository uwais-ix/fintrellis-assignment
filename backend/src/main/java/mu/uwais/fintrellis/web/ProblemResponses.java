package mu.uwais.fintrellis.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
public class ProblemResponses {
  private final ObjectMapper objectMapper;

  public ProblemDetail create(HttpServletRequest request, HttpStatusCode status, String detail) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
    return enrich(request, problem);
  }

  public ProblemDetail enrich(HttpServletRequest request, ProblemDetail problem) {
    Object attribute = request.getAttribute("requestId");
    String requestId = attribute == null ? UUID.randomUUID().toString() : attribute.toString();
    problem.setInstance(URI.create("urn:uuid:" + requestId));
    problem.setProperty("requestId", requestId);
    return problem;
  }

  public void write(
      HttpServletRequest request,
      HttpServletResponse response,
      HttpStatusCode status,
      String detail)
      throws IOException {
    response.setStatus(status.value());
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    objectMapper.writeValue(response.getOutputStream(), create(request, status, detail));
  }
}
