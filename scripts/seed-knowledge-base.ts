import { listKbDocuments, uploadKbText, updateKbDocument } from "@/lib/elevenlabs/client";
import { buildSeedMarkdown } from "@/lib/knowledge-base/buildSeedMarkdown";

const DOCUMENT_NAME = "Daydreams & Dumbbells — Business Info";

/**
 * One-time bootstrap: uploads (or updates, if a document with this name
 * already exists) the generated business-info markdown to the ElevenLabs
 * knowledge base. Idempotent by name, so re-running is safe. After this
 * initial seed, further content edits happen live through /admin/kb.
 */
async function main() {
  const markdown = await buildSeedMarkdown();
  const existing = await listKbDocuments();
  const match = existing.find((doc) => doc.name === DOCUMENT_NAME);

  if (match) {
    await updateKbDocument(match.id, { text: markdown });
    console.log(`Updated existing knowledge base document: ${match.id}`);
  } else {
    const created = await uploadKbText(markdown, DOCUMENT_NAME);
    console.log(`Uploaded new knowledge base document: ${created.id}`);
  }
}

main().catch((error) => {
  console.error("Failed to seed knowledge base:", error);
  process.exit(1);
});
