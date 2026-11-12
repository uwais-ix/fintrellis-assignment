package mu.uwais.fintrellis.identity.internal;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class ActorClaimsTest {
  @Test
  void usesTheSubjectWhenPresent() {
    Jwt jwt =
        Jwt.withTokenValue("token")
            .header("alg", "none")
            .subject("user-123")
            .claim("name", "Alex Administrator")
            .build();

    assertThat(ActorClaims.from(jwt).subject()).isEqualTo("user-123");
    assertThat(ActorClaims.from(jwt).displayName()).isEqualTo("Alex Administrator");
  }

  @Test
  void fallsBackToUsernameWhenTheAccessTokenHasNoSubject() {
    Jwt jwt =
        Jwt.withTokenValue("token")
            .header("alg", "none")
            .claim("preferred_username", "admin")
            .claim("name", "Alex Administrator")
            .build();

    assertThat(ActorClaims.from(jwt).subject()).isEqualTo("admin");
  }

  @Test
  void fallsBackToEmailThenClientWhenUsernameIsMissing() {
    Jwt emailOnly =
        Jwt.withTokenValue("token").header("alg", "none").claim("email", "a@example.test").build();
    Jwt clientOnly =
        Jwt.withTokenValue("token").header("alg", "none").claim("azp", "journal-web").build();

    assertThat(ActorClaims.from(emailOnly).subject()).isEqualTo("a@example.test");
    assertThat(ActorClaims.from(clientOnly).subject()).isEqualTo("journal-web");
  }

  @Test
  void suppliesReadableDefaultsForSparseTokens() {
    Jwt jwt = Jwt.withTokenValue("token").header("alg", "none").claim("scope", "openid").build();

    assertThat(ActorClaims.from(jwt).subject()).isEqualTo("unknown");
    assertThat(ActorClaims.from(jwt).displayName()).isEqualTo("Contributor");
  }
}
