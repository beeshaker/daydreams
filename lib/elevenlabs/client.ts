const ELEVENLABS_API_BASE = "https://api.elevenlabs.io";

export class ElevenLabsApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`ElevenLabs API error (${status})`);
    this.name = "ElevenLabsApiError";
    this.status = status;
    this.body = body;
  }
}

export function requireEnv(name: "ELEVENLABS_API_KEY" | "ELEVENLABS_AGENT_ID"): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function elevenlabsFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const apiKey = requireEnv("ELEVENLABS_API_KEY");
  const res = await fetch(`${ELEVENLABS_API_BASE}${path}`, {
    ...init,
    headers: { "xi-api-key": apiKey, ...init.headers },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => undefined);
    }
    throw new ElevenLabsApiError(res.status, body);
  }

  return res;
}

export type KbDocumentSummary = {
  id: string;
  name: string;
  type: string;
  created_at_unix_secs?: number;
};

export type KbDocument = KbDocumentSummary & {
  extracted_inner_html?: string;
  text?: string;
};

export type AgentConfig = Record<string, unknown>;

/** Mints a short-lived signed URL the browser uses to open the voice session directly with ElevenLabs. */
export async function getSignedConversationUrl(agentId: string): Promise<{ signedUrl: string }> {
  const res = await elevenlabsFetch(
    `/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
  );
  const data = (await res.json()) as { signed_url: string };
  return { signedUrl: data.signed_url };
}

/** Used only by the one-off agent-configuration script — not called from any request path. */
export async function getAgentConfig(agentId: string): Promise<AgentConfig> {
  const res = await elevenlabsFetch(`/v1/convai/agents/${encodeURIComponent(agentId)}`);
  return res.json();
}

/** Used only by the one-off agent-configuration script — not called from any request path. */
export async function patchAgentConfig(
  agentId: string,
  patch: Record<string, unknown>,
): Promise<AgentConfig> {
  const res = await elevenlabsFetch(`/v1/convai/agents/${encodeURIComponent(agentId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function listKbDocuments(): Promise<KbDocumentSummary[]> {
  const res = await elevenlabsFetch(`/v1/convai/knowledge-base`);
  const data = (await res.json()) as { documents: KbDocumentSummary[] };
  return data.documents;
}

export async function getKbDocument(documentationId: string): Promise<KbDocument> {
  const res = await elevenlabsFetch(
    `/v1/convai/knowledge-base/${encodeURIComponent(documentationId)}`,
  );
  return res.json();
}

export async function uploadKbFile(file: Blob, name?: string): Promise<{ id: string }> {
  const form = new FormData();
  form.append("file", file);
  if (name) form.append("name", name);
  const res = await elevenlabsFetch(`/v1/convai/knowledge-base/file`, {
    method: "POST",
    body: form,
  });
  return res.json();
}

export async function uploadKbUrl(url: string, name?: string): Promise<{ id: string }> {
  const res = await elevenlabsFetch(`/v1/convai/knowledge-base/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, name }),
  });
  return res.json();
}

export async function uploadKbText(text: string, name?: string): Promise<{ id: string }> {
  const res = await elevenlabsFetch(`/v1/convai/knowledge-base/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, name }),
  });
  return res.json();
}

export async function updateKbDocument(
  documentationId: string,
  patch: { name?: string; text?: string },
): Promise<KbDocument> {
  const res = await elevenlabsFetch(
    `/v1/convai/knowledge-base/${encodeURIComponent(documentationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  return res.json();
}

export async function deleteKbDocument(
  documentationId: string,
  opts: { force?: boolean } = {},
): Promise<void> {
  const query = opts.force ? "?force=true" : "";
  await elevenlabsFetch(
    `/v1/convai/knowledge-base/${encodeURIComponent(documentationId)}${query}`,
    { method: "DELETE" },
  );
}
