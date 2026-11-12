package mu.uwais.fintrellis.posts.internal.web;

import java.util.List;
import mu.uwais.fintrellis.posts.internal.domain.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    unmappedTargetPolicy = ReportingPolicy.ERROR,
    unmappedSourcePolicy = ReportingPolicy.IGNORE)
interface PostWebMapper {
  PostResponse toResponse(Post post);

  @Mapping(target = "excerpt", source = "content", qualifiedByName = "excerpt")
  PostSummary toSummary(Post post);

  default PostPage toPage(Page<Post> page) {
    List<PostSummary> items = page.map(this::toSummary).getContent();
    return new PostPage(
        items, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
  }

  @Named("excerpt")
  default String excerpt(String content) {
    String text = content.replaceAll("\\s+", " ");
    int length = text.codePointCount(0, text.length());
    return length > 180 ? text.substring(0, text.offsetByCodePoints(0, 180)) + "…" : text;
  }
}
