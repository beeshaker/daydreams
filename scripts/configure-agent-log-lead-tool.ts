import { getAgentConfig, patchAgentConfig, requireEnv } from "@/lib/elevenlabs/client";

/**
 * Must already appear in the agent's system prompt (set up once via the
 * ElevenLabs dashboard) — the script anchors its insertion here rather than
 * blindly appending, and aborts loudly if it's missing so a prompt rewrite
 * elsewhere can't silently end up with a dangling, disconnected bullet.
 */
const ANCHOR = "You can help visitors learn about Daydreams (daycare) and Dumbbells (gym).";

const LOG_LEAD_MARKER = "call the log_lead tool";

const PROMPT_BULLET =
  "\n\nIf a visitor wants to be contacted (to book a visit, join a class, or get more info), " +
  "first confirm out loud that they agree to be contacted, then call the log_lead tool with " +
  'their name, email, and which side they\'re interested in ("daycare" or "gym").';

const LOG_LEAD_TOOL = {
  type: "client",
  name: "log_lead",
  description:
    "Logs a visitor's contact info as a lead after they've verbally agreed to be contacted. Only call this after explicit consent.",
  parameters: {
    type: "object",
    properties: {
      interest: {
        type: "string",
        enum: ["daycare", "gym"],
        description: "Which side the visitor is interested in.",
      },
      name: { type: "string", description: "The visitor's name." },
      email: { type: "string", description: "The visitor's email address." },
      phone: { type: "string", description: "The visitor's phone number, if given." },
      message: { type: "string", description: "Any additional context from the conversation." },
    },
    required: ["interest", "name", "email"],
  },
};

type AgentPromptConfig = {
  prompt?: string;
  tools?: Array<{ name?: string; [key: string]: unknown }>;
  [key: string]: unknown;
};

type AgentAgentConfig = {
  prompt?: AgentPromptConfig;
  [key: string]: unknown;
};

type ConversationConfig = {
  agent?: AgentAgentConfig;
  [key: string]: unknown;
};

async function main() {
  const agentId = requireEnv("ELEVENLABS_AGENT_ID");
  const config = await getAgentConfig(agentId);
  const conversationConfig = (config.conversation_config ?? {}) as ConversationConfig;
  const currentPrompt = conversationConfig.agent?.prompt?.prompt;

  if (typeof currentPrompt !== "string") {
    throw new Error(
      "Could not find conversation_config.agent.prompt.prompt in the agent config — " +
        "the agent schema may have changed since this script was written. Aborting.",
    );
  }

  if (!currentPrompt.includes(ANCHOR)) {
    throw new Error(
      `Expected anchor text not found in the agent's system prompt:\n"${ANCHOR}"\n\n` +
        "Aborting rather than guessing where to insert the log_lead instructions — " +
        "update ANCHOR in this script to match the current prompt, or add the anchor " +
        "sentence to the prompt in the ElevenLabs dashboard first.",
    );
  }

  const existingTools = conversationConfig.agent?.prompt?.tools ?? [];
  const hasLogLeadTool = existingTools.some((tool) => tool.name === "log_lead");
  const hasPromptBullet = currentPrompt.includes(LOG_LEAD_MARKER);

  if (hasLogLeadTool && hasPromptBullet) {
    console.log("Agent already has the log_lead tool and prompt bullet — nothing to do.");
    return;
  }

  const nextPrompt = hasPromptBullet ? currentPrompt : currentPrompt + PROMPT_BULLET;
  const nextTools = hasLogLeadTool ? existingTools : [...existingTools, LOG_LEAD_TOOL];

  await patchAgentConfig(agentId, {
    conversation_config: {
      ...conversationConfig,
      agent: {
        ...conversationConfig.agent,
        prompt: {
          ...conversationConfig.agent?.prompt,
          prompt: nextPrompt,
          tools: nextTools,
        },
      },
    },
  });

  console.log("Agent updated with the log_lead tool and prompt instructions.");
}

main().catch((error) => {
  console.error("Failed to configure agent:", error);
  process.exit(1);
});
