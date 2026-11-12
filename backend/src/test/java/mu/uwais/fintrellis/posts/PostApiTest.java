package mu.uwais.fintrellis.posts;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import mu.uwais.fintrellis.PostgresIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class PostApiTest extends PostgresIntegrationTest {
  @Autowired private MockMvc mvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private JdbcTemplate jdbc;

  @BeforeEach
  void clearPosts() {
    jdbc.update("delete from posts");
  }

  @Test
  void editorCanCreateAndEveryoneCanReadPersistedPosts() throws Exception {
    JsonNode created = createPost("  A thoughtful title  ", "A useful body.");
    String id = created.get("id").asText();

    mvc.perform(get("/api/posts/{id}", id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("A thoughtful title"))
        .andExpect(jsonPath("$.authorSubject").value("editor-1"))
        .andExpect(jsonPath("$.authorName").value("Ellis Editor"))
        .andExpect(jsonPath("$.version").value(0));
    assertThat(jdbc.queryForObject("select count(*) from posts", Integer.class)).isEqualTo(1);
  }

  @Test
  void listIsPaginatedAndDoesNotExposeFullBodies() throws Exception {
    createPost("First", "First body");
    createPost("Second", "Second body");

    mvc.perform(get("/api/posts").param("size", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items.length()").value(1))
        .andExpect(jsonPath("$.items[0].title").value("Second"))
        .andExpect(jsonPath("$.items[0].content").doesNotExist())
        .andExpect(jsonPath("$.totalElements").value(2))
        .andExpect(jsonPath("$.totalPages").value(2));
  }

  @Test
  void searchIsCaseInsensitiveAndTreatsWildcardsAsText() throws Exception {
    createPost("A quiet morning", "An idea worth sharing");
    createPost("100% complete", "A progress note.");
    createPost("snake_case notes", "A naming note.");
    createPost("Path C:\\notes", "A path note.");

    mvc.perform(get("/api/posts").param("q", "QUIET"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1));
    mvc.perform(get("/api/posts").param("q", "sharing"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1));
    mvc.perform(get("/api/posts").param("q", "%"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1))
        .andExpect(jsonPath("$.items[0].title").value("100% complete"));
    mvc.perform(get("/api/posts").param("q", "_"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1))
        .andExpect(jsonPath("$.items[0].title").value("snake_case notes"));
    mvc.perform(get("/api/posts").param("q", "\\"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(1))
        .andExpect(jsonPath("$.items[0].title").value("Path C:\\notes"));
    mvc.perform(get("/api/posts").param("q", "   "))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements").value(4));
  }

  @Test
  void staleUpdatesAreRejectedWithoutLosingTheNewerContent() throws Exception {
    JsonNode created = createPost("Original", "Original body");
    String id = created.get("id").asText();
    String update = json(Map.of("title", "Revised", "content", "Revised body", "version", 0));

    mvc.perform(
            put("/api/posts/{id}", id)
                .with(editor())
                .contentType("application/json")
                .content(update))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.version").value(1));
    mvc.perform(
            put("/api/posts/{id}", id)
                .with(editor())
                .contentType("application/json")
                .content(update))
        .andExpect(status().isConflict())
        .andExpect(content().contentTypeCompatibleWith("application/problem+json"));
    mvc.perform(get("/api/posts/{id}", id)).andExpect(jsonPath("$.title").value("Revised"));
  }

  @Test
  void administratorsCanDeletePosts() throws Exception {
    String id = createPost("Remove me", "Body").get("id").asText();
    mvc.perform(
            delete("/api/posts/{id}", id)
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_administrator"))))
        .andExpect(status().isNoContent())
        .andExpect(content().string(""));
    mvc.perform(get("/api/posts/{id}", id))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.requestId").isNotEmpty());
  }

  @Test
  void validationReportsFieldErrorsWithoutSavingAnything() throws Exception {
    mvc.perform(
            post("/api/posts")
                .with(editor())
                .contentType("application/json")
                .content(json(Map.of("title", " ", "content", ""))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors.title").isNotEmpty())
        .andExpect(jsonPath("$.fieldErrors.content").isNotEmpty())
        .andExpect(header().exists("X-Request-Id"));
    assertThat(jdbc.queryForObject("select count(*) from posts", Integer.class)).isZero();
  }

  @Test
  void invalidPaginationAndIdentifiersAreBadRequests() throws Exception {
    mvc.perform(get("/api/posts").param("size", "31")).andExpect(status().isBadRequest());
    mvc.perform(get("/api/posts").param("page", "-1")).andExpect(status().isBadRequest());
    mvc.perform(get("/api/posts/not-a-uuid")).andExpect(status().isBadRequest());
  }

  @Test
  void malformedJsonAndMissingVersionAreBadRequests() throws Exception {
    mvc.perform(post("/api/posts").with(editor()).contentType("application/json").content("{"))
        .andExpect(status().isBadRequest());
    String id = createPost("Title", "Body").get("id").asText();
    mvc.perform(
            put("/api/posts/{id}", id)
                .with(editor())
                .contentType("application/json")
                .content(json(Map.of("title", "Changed", "content", "Body"))))
        .andExpect(status().isBadRequest());
  }

  private JsonNode createPost(String title, String body) throws Exception {
    var response =
        mvc.perform(
                post("/api/posts")
                    .with(editor())
                    .contentType("application/json")
                    .content(json(Map.of("title", title, "content", body))))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"))
            .andReturn()
            .getResponse();
    return objectMapper.readTree(response.getContentAsString());
  }

  private String json(Object value) {
    return objectMapper.writeValueAsString(value);
  }

  private static RequestPostProcessor editor() {
    return jwt()
        .jwt(token -> token.subject("editor-1").claim("name", "Ellis Editor"))
        .authorities(new SimpleGrantedAuthority("ROLE_editor"));
  }
}
