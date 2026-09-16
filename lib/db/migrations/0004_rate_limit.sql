CREATE TABLE rate_limit_events (
  id BIGSERIAL PRIMARY KEY,
  bucket TEXT NOT NULL,
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limit_events_lookup ON rate_limit_events (bucket, identifier, created_at);
