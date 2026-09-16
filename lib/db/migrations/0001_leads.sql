CREATE TABLE leads (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_type TEXT NOT NULL,
  source TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  child_age TEXT,
  preferred_contact TEXT,
  message TEXT,
  consent BOOLEAN NOT NULL,
  email_notification_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_leads_email ON leads (email);
CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_created_at ON leads (created_at);
