import { z } from "zod";
import { INSTAGRAM_ACCOUNT_ID } from "../auth.js";
import { apiRequest, toolResult, toolError } from "../client.js";
export function registerProfileTools(server) {
    server.registerTool("get_profile", {
        title: "Get Instagram Profile",
        description: "Get the Instagram Business account profile including username, bio, follower count, following count, media count, and profile picture.",
        inputSchema: {
            fields: z
                .string()
                .optional()
                .describe("Comma-separated fields. Default: id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const fields = args.fields ||
                "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website";
            const data = await apiRequest(`/${INSTAGRAM_ACCOUNT_ID}`, "GET", undefined, { fields });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get profile: ${error.message}`);
        }
    });
    server.registerTool("get_media_detail", {
        title: "Get Media Detail",
        description: "Get detailed information about a specific Instagram media post by its ID, including caption, type, URL, permalink, timestamp, likes, and comments count.",
        inputSchema: {
            media_id: z.string().describe("The media ID to get details for"),
            fields: z
                .string()
                .optional()
                .describe("Comma-separated fields. Default: id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const fields = args.fields ||
                "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
            const data = await apiRequest(`/${args.media_id}`, "GET", undefined, { fields });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get media detail: ${error.message}`);
        }
    });
}
