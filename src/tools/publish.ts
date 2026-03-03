import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  createMediaContainer,
  waitForContainerReady,
  publishContainer,
  toolResult,
  toolError,
} from "../client.js";

export function registerPublishTools(server: McpServer) {
  server.registerTool(
    "publish_photo",
    {
      title: "Publish Photo",
      description:
        "Publish a single photo to Instagram feed. Requires a public image URL. Optionally add a caption, location, and user tags.",
      inputSchema: {
        image_url: z.string().describe("Public URL of the image to publish"),
        caption: z.string().optional().describe("Post caption (max 2200 characters)"),
        location_id: z.string().optional().describe("Facebook Page ID for location tag"),
        user_tags: z
          .string()
          .optional()
          .describe(
            'JSON array of user tags: [{"username":"user1","x":0.5,"y":0.5}]. Coordinates are 0-1 range.'
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const params: Record<string, string | undefined> = {
          image_url: args.image_url,
          caption: args.caption,
          location_id: args.location_id,
          user_tags: args.user_tags,
        };

        const container = await createMediaContainer(params);
        const published = await publishContainer(container.id);
        return toolResult({ success: true, media_id: published.id });
      } catch (error) {
        return toolError(`Failed to publish photo: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "publish_reel",
    {
      title: "Publish Reel",
      description:
        "Publish a Reel (short video) to Instagram. Requires a public video URL. Video processing may take time.",
      inputSchema: {
        video_url: z.string().describe("Public URL of the video to publish"),
        caption: z.string().optional().describe("Post caption (max 2200 characters)"),
        cover_url: z.string().optional().describe("Public URL of a custom cover image"),
        share_to_feed: z
          .string()
          .optional()
          .describe("Share Reel to feed as well (true/false, default: true)"),
        location_id: z.string().optional().describe("Facebook Page ID for location tag"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const params: Record<string, string | undefined> = {
          media_type: "REELS",
          video_url: args.video_url,
          caption: args.caption,
          cover_url: args.cover_url,
          share_to_feed: args.share_to_feed,
          location_id: args.location_id,
        };

        const container = await createMediaContainer(params);
        await waitForContainerReady(container.id);
        const published = await publishContainer(container.id);
        return toolResult({ success: true, media_id: published.id });
      } catch (error) {
        return toolError(`Failed to publish reel: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "publish_carousel",
    {
      title: "Publish Carousel",
      description:
        "Publish a carousel (album) post with 2-10 images/videos. Each item needs a public URL. Videos require processing time.",
      inputSchema: {
        items: z
          .string()
          .describe(
            'JSON array of items: [{"type":"IMAGE","url":"https://..."},{"type":"VIDEO","url":"https://..."}]. Type: IMAGE or VIDEO.'
          ),
        caption: z.string().optional().describe("Post caption (max 2200 characters)"),
        location_id: z.string().optional().describe("Facebook Page ID for location tag"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const items = JSON.parse(args.items) as Array<{
          type: "IMAGE" | "VIDEO";
          url: string;
        }>;

        if (items.length < 2 || items.length > 10) {
          return toolError("Carousel requires 2-10 items.");
        }

        // Step 1: Create containers for each item
        const childIds: string[] = [];
        for (const item of items) {
          const params: Record<string, string | undefined> = {
            is_carousel_item: "true",
          };
          if (item.type === "VIDEO") {
            params.media_type = "VIDEO";
            params.video_url = item.url;
          } else {
            params.image_url = item.url;
          }
          const container = await createMediaContainer(params);
          childIds.push(container.id);
        }

        // Step 2: Wait for video containers to be ready
        for (let i = 0; i < items.length; i++) {
          if (items[i].type === "VIDEO") {
            await waitForContainerReady(childIds[i]);
          }
        }

        // Step 3: Create carousel container
        const carouselContainer = await createMediaContainer({
          media_type: "CAROUSEL",
          children: childIds.join(","),
          caption: args.caption,
          location_id: args.location_id,
        });

        // Step 4: Publish
        const published = await publishContainer(carouselContainer.id);
        return toolResult({ success: true, media_id: published.id });
      } catch (error) {
        if (error instanceof SyntaxError) {
          return toolError("Invalid JSON in 'items' parameter. Expected array of {type, url} objects.");
        }
        return toolError(`Failed to publish carousel: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "publish_story",
    {
      title: "Publish Story",
      description:
        "Publish a story (image or video) to Instagram. Stories disappear after 24 hours.",
      inputSchema: {
        media_type: z
          .enum(["IMAGE", "VIDEO"])
          .describe("Type of media: IMAGE or VIDEO"),
        media_url: z.string().describe("Public URL of the image or video"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const params: Record<string, string | undefined> = {};

        if (args.media_type === "VIDEO") {
          params.media_type = "STORIES";
          params.video_url = args.media_url;
        } else {
          params.media_type = "STORIES";
          params.image_url = args.media_url;
        }

        const container = await createMediaContainer(params);

        if (args.media_type === "VIDEO") {
          await waitForContainerReady(container.id);
        }

        const published = await publishContainer(container.id);
        return toolResult({ success: true, media_id: published.id });
      } catch (error) {
        return toolError(`Failed to publish story: ${(error as Error).message}`);
      }
    },
  );
}
