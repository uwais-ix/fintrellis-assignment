CREATE TABLE posts (
    id UUID PRIMARY KEY,
    title VARCHAR(160) NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT NOT NULL CHECK (length(trim(content)) BETWEEN 1 AND 20000),
    author_subject VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX posts_updated_at_id_idx ON posts (updated_at DESC, id DESC);
