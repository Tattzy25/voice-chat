import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";

interface Env {
  R2: R2Bucket;
}

function createServer(env: Env) {
  const server = new McpServer({
    name: "nonya",
    version: "1.0.0",
  });

  server.registerTool(
    "r2-chat",
    {
      description: "Add conversations to the R2 bucket",
      inputSchema: {
        session_id: z.string(),
        domain: z.string().optional(),
        customer_id: z.string().optional(),
        audio_url: z.string().optional(),
        duration_seconds: z.number().optional(),
        assistant: z.string().optional(),
        user: z.string().optional(),
        timestamp: z.string().optional(),
      },
    },
    async (args) => {
      const key = `conversations/${args.domain}/${args.session_id}.json`;
      await env.R2.put(key, JSON.stringify(args));

      return {
        content: [
          {
            type: "text",
            text: `Conversation ${args.session_id} saved to R2 at ${key}`,
          },
        ],
      };
    }
  );

  return server;
}

export default {
  fetch(request, env: Env, ctx) {
    return createMcpHandler(() => createServer(env))(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
