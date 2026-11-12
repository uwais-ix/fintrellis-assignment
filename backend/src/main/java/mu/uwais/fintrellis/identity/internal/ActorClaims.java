package mu.uwais.fintrellis.identity.internal;

import java.util.Objects;
import mu.uwais.fintrellis.identity.Actor;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Resolves a stable actor identity from the claims an identity provider actually sends.
 *
 * <p>Access tokens do not always carry {@code sub}. Username or email remain unique per realm and
 * are suitable fallbacks for attribution.
 */
final class ActorClaims {
  private ActorClaims() {}

  static Actor from(Jwt jwt) {
    String subject =
        firstPresent(
            jwt.getSubject(),
            jwt.getClaimAsString("preferred_username"),
            jwt.getClaimAsString("email"),
            jwt.getClaimAsString("azp"));
    String name =
        firstPresent(
            jwt.getClaimAsString("name"), jwt.getClaimAsString("preferred_username"), subject);
    return new Actor(
        Objects.requireNonNullElse(subject, "unknown"),
        Objects.requireNonNullElse(name, "Contributor"));
  }

  private static String firstPresent(String... values) {
    for (String value : values) {
      if (value != null && !value.isBlank()) return value;
    }
    return null;
  }
}
