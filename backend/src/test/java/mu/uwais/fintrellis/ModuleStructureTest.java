package mu.uwais.fintrellis;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModuleStructureTest {
  @Test
  void moduleDependenciesRespectPublicBoundaries() {
    ApplicationModules.of(JournalApplication.class).verify();
  }
}
