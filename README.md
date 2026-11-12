# Fintrellis Journal

A small editorial workspace for reading, writing, and managing blog posts.

## Structure

- `backend/`: Spring Boot application, organized into business modules.
- `frontend/`: React application with feature-owned components and data access.
- `contracts/`: public HTTP contract and generated frontend transport types.
- `infra/`: local identity provider and web server configuration.
- `tests/e2e/`: browser acceptance tests.

The implementation history is intentionally incremental. See
[the transfer guide](docs/transfer-guide.md) to reproduce each layer in another repository.
