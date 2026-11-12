package mu.uwais.fintrellis.identity.internal;

import mu.uwais.fintrellis.identity.Actor;
import mu.uwais.fintrellis.identity.CurrentActor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
class JwtCurrentActor implements CurrentActor {
  @Override
  public Actor require() {
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    if (!(authentication instanceof JwtAuthenticationToken token)) {
      throw new AuthenticationCredentialsNotFoundException("Authentication is required");
    }
    String name = token.getToken().getClaimAsString("name");
    if (name == null || name.isBlank()) {
      name = token.getToken().getClaimAsString("preferred_username");
    }
    return new Actor(token.getToken().getSubject(), name == null ? "Contributor" : name);
  }
}
