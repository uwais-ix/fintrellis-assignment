package mu.uwais.fintrellis.posts.internal.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdatePostRequest(
    @NotBlank(message = "Enter a title.") @Size(max = 160, message = "Use at most 160 characters.")
        String title,
    @NotBlank(message = "Write some content.")
        @Size(max = 20000, message = "Use at most 20,000 characters.")
        String content,
    @NotNull @PositiveOrZero Long version) {}
