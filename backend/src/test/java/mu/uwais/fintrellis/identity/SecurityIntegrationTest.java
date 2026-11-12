package mu.uwais.fintrellis.identity;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import mu.uwais.fintrellis.PostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.test.web.servlet.MockMvc;

class SecurityIntegrationTest extends PostgresIntegrationTest {
  @Autowired private MockMvc mvc;

  @Test
  void anonymousWritesReceiveAProblemAndBearerChallenge() throws Exception {
    mvc.perform(post("/api/posts").contentType("application/json").content("{}"))
        .andExpect(status().isUnauthorized())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
        .andExpect(header().string("WWW-Authenticate", "Bearer"))
        .andExpect(jsonPath("$.requestId").isNotEmpty());
  }

  @Test
  void readersCannotCreatePosts() throws Exception {
    mvc.perform(
            post("/api/posts").with(jwt().authorities(new SimpleGrantedAuthority("ROLE_reader"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void editorsCannotDeletePosts() throws Exception {
    mvc.perform(
            delete("/api/posts/00000000-0000-0000-0000-000000000001")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_editor"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.status").value(403));
  }

  @Test
  void invalidTokensReturnAnUnauthorizedProblem() throws Exception {
    when(jwtDecoder.decode("invalid")).thenThrow(new BadJwtException("Invalid signature"));

    mvc.perform(get("/api/posts").header("Authorization", "Bearer invalid"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value("Sign in to continue."));
  }

  @Test
  void managementEndpointsAreNotPublic() throws Exception {
    mvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
  }
}
