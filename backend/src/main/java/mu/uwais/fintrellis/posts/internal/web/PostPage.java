package mu.uwais.fintrellis.posts.internal.web;

import java.util.List;

record PostPage(List<PostSummary> items, int page, int size, long totalElements, int totalPages) {}
