import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";
export function registerCommunityTools(server) {
    server.registerTool("list_comments", {
        title: "List Comments",
        description: "List comments on a specific Instagram media post. Returns comment text, author, timestamp, like count, and reply count.",
        inputSchema: {
            media_id: z.string().describe("The media ID to get comments for"),
            fields: z
                .string()
                .optional()
                .describe("Comma-separated fields. Default: id,text,username,timestamp,like_count,replies{id,text,username,timestamp}"),
            limit: z
                .string()
                .optional()
                .describe("Number of comments to return (default: 50)"),
            after: z
                .string()
                .optional()
                .describe("Cursor for pagination"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const fields = args.fields ||
                "id,text,username,timestamp,like_count,replies{id,text,username,timestamp}";
            const data = await apiRequest(`/${args.media_id}/comments`, "GET", undefined, { fields, limit: args.limit || "50", after: args.after });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to list comments: ${error.message}`);
        }
    });
    server.registerTool("reply_to_comment", {
        title: "Reply to Comment",
        description: "Reply to a specific comment on an Instagram post. The reply will appear as a nested response under the original comment.",
        inputSchema: {
            comment_id: z.string().describe("The comment ID to reply to"),
            message: z.string().describe("The reply text"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const data = await apiRequest(`/${args.comment_id}/replies`, "POST", undefined, { message: args.message });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to reply to comment: ${error.message}`);
        }
    });
    server.registerTool("delete_comment", {
        title: "Delete Comment",
        description: "Delete a specific comment from an Instagram post. This action is irreversible.",
        inputSchema: {
            comment_id: z.string().describe("The comment ID to delete"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            await apiRequest(`/${args.comment_id}`, "DELETE");
            return toolResult({ success: true, deleted: args.comment_id });
        }
        catch (error) {
            return toolError(`Failed to delete comment: ${error.message}`);
        }
    });
}
