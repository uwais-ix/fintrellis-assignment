package mu.uwais.fintrellis.identity.internal;

import mu.uwais.fintrellis.identity.Actor;
import mu.uwais.fintrellis.identity.CurrentActor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
class JwtCurrentActor implements CurrentActor {
  @Override
  public Actor require() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (!(authentication instanceof JwtAuthenticationToken token)) {
      throw new AuthenticationCredentialsNotFoundException("Authentication is required");
    }
    return ActorClaims.from(token.getToken());
  }
}
