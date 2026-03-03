import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { INSTAGRAM_ACCOUNT_ID } from "../auth.js";
import { apiRequest, apiRequestAllPages, toolResult, toolError } from "../client.js";

interface MediaNode {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

export function registerMediaTools(server: McpServer) {
  server.registerTool(
    "list_media",
    {
      title: "List Recent Media",
      description:
        "List recent Instagram media posts with pagination. Returns posts in reverse chronological order.",
      inputSchema: {
        fields: z
          .string()
          .optional()
          .describe(
            "Comma-separated fields. Default: id,caption,media_type,permalink,timestamp,like_count,comments_count"
          ),
        limit: z
          .string()
          .optional()
          .describe("Number of posts to return per page (default: 25, max: 100)"),
        after: z
          .string()
          .optional()
          .describe("Cursor for pagination (from previous response)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const fields =
          args.fields ||
          "id,caption,media_type,permalink,timestamp,like_count,comments_count";
        const data = await apiRequest(
          `/${INSTAGRAM_ACCOUNT_ID}/media`,
          "GET",
          undefined,
          { fields, limit: args.limit || "25", after: args.after },
        );
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to list media: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "list_stories",
    {
      title: "List Active Stories",
      description:
        "List currently active Instagram stories (only available for 24h after publishing).",
      inputSchema: {
        fields: z
          .string()
          .optional()
          .describe(
            "Comma-separated fields. Default: id,media_type,media_url,timestamp,permalink"
          ),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const fields =
          args.fields || "id,media_type,media_url,timestamp,permalink";
        const data = await apiRequest(
          `/${INSTAGRAM_ACCOUNT_ID}/stories`,
          "GET",
          undefined,
          { fields },
        );
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to list stories: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "list_top_media",
    {
      title: "List Top Media by Engagement",
      description:
        "Fetch recent media and sort by engagement (likes + comments). Useful for finding best-performing posts.",
      inputSchema: {
        limit: z
          .string()
          .optional()
          .describe("Number of posts to analyze (default: 50, max: 200)"),
        top: z
          .string()
          .optional()
          .describe("Number of top posts to return (default: 10)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const limit = Math.min(parseInt(args.limit || "50", 10), 200);
        const top = parseInt(args.top || "10", 10);
        const fields = "id,caption,media_type,permalink,timestamp,like_count,comments_count";

        const posts = await apiRequestAllPages<MediaNode>(
          `/${INSTAGRAM_ACCOUNT_ID}/media`,
          { fields, limit: String(Math.min(limit, 100)) },
        );

        const sorted = posts
          .slice(0, limit)
          .map((p) => ({
            ...p,
            engagement: (p.like_count || 0) + (p.comments_count || 0),
          }))
          .sort((a, b) => b.engagement - a.engagement)
          .slice(0, top);

        return toolResult({ data: sorted, total_analyzed: Math.min(posts.length, limit) });
      } catch (error) {
        return toolError(`Failed to list top media: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "list_children",
    {
      title: "List Carousel Items",
      description:
        "List the individual items (children) of a carousel album post.",
      inputSchema: {
        media_id: z.string().describe("The carousel media ID"),
        fields: z
          .string()
          .optional()
          .describe("Comma-separated fields. Default: id,media_type,media_url,timestamp"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const fields = args.fields || "id,media_type,media_url,timestamp";
        const data = await apiRequest(
          `/${args.media_id}/children`,
          "GET",
          undefined,
          { fields },
        );
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to list children: ${(error as Error).message}`);
      }
    },
  );
}
