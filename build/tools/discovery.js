import { z } from "zod";
import { INSTAGRAM_ACCOUNT_ID } from "../auth.js";
import { apiRequest, toolResult, toolError } from "../client.js";
export function registerDiscoveryTools(server) {
    server.registerTool("search_hashtag", {
        title: "Search Hashtag",
        description: "Search for an Instagram hashtag and get its ID. Use the returned ID with get_hashtag_top_media. Limited to 30 unique hashtag searches per 7 days.",
        inputSchema: {
            query: z.string().describe("The hashtag to search for (without #)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const data = await apiRequest("/ig_hashtag_search", "GET", undefined, { q: args.query, user_id: INSTAGRAM_ACCOUNT_ID });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to search hashtag: ${error.message}`);
        }
    });
    server.registerTool("get_hashtag_top_media", {
        title: "Get Hashtag Top Media",
        description: "Get the top (most popular) media posts for a hashtag ID. Use search_hashtag first to get the hashtag ID.",
        inputSchema: {
            hashtag_id: z.string().describe("The hashtag ID (from search_hashtag)"),
            fields: z
                .string()
                .optional()
                .describe("Comma-separated fields. Default: id,caption,media_type,permalink,timestamp,like_count,comments_count"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const fields = args.fields ||
                "id,caption,media_type,permalink,timestamp,like_count,comments_count";
            const data = await apiRequest(`/${args.hashtag_id}/top_media`, "GET", undefined, { user_id: INSTAGRAM_ACCOUNT_ID, fields });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get hashtag top media: ${error.message}`);
        }
    });
}
