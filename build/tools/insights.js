import { z } from "zod";
import { INSTAGRAM_ACCOUNT_ID } from "../auth.js";
import { apiRequest, toolResult, toolError } from "../client.js";
export function registerInsightTools(server) {
    server.registerTool("get_account_insights", {
        title: "Get Account Insights",
        description: "Get Instagram account-level insights (impressions, reach, profile views, website clicks, follower count, etc.) for a given period.",
        inputSchema: {
            metric: z
                .string()
                .optional()
                .describe("Comma-separated metrics. Default: impressions,reach,accounts_engaged,profile_views,website_clicks,follows_and_unfollows. Available: impressions, reach, accounts_engaged, total_interactions, likes, comments, shares, saves, replies, profile_views, website_clicks, follows_and_unfollows"),
            period: z
                .enum(["day", "week", "days_28"])
                .optional()
                .describe("Aggregation period (default: day)"),
            since: z
                .string()
                .optional()
                .describe("Start date as UNIX timestamp or YYYY-MM-DD (converted to timestamp)"),
            until: z
                .string()
                .optional()
                .describe("End date as UNIX timestamp or YYYY-MM-DD (converted to timestamp)"),
            metric_type: z
                .enum(["total_value", "time_series"])
                .optional()
                .describe("Result type (default: total_value)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const metric = args.metric ||
                "impressions,reach,accounts_engaged,profile_views,website_clicks,follows_and_unfollows";
            const params = {
                metric,
                period: args.period || "day",
                metric_type: args.metric_type || "total_value",
                since: toTimestamp(args.since),
                until: toTimestamp(args.until),
            };
            const data = await apiRequest(`/${INSTAGRAM_ACCOUNT_ID}/insights`, "GET", undefined, params);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get account insights: ${error.message}`);
        }
    });
    server.registerTool("get_media_insights", {
        title: "Get Media Insights",
        description: "Get insights for a specific media post (impressions, reach, engagement, saved, video views, etc.). Metrics available depend on media type.",
        inputSchema: {
            media_id: z.string().describe("The media ID to get insights for"),
            metric: z
                .string()
                .optional()
                .describe("Comma-separated metrics. Default: impressions,reach,total_interactions,likes,comments,shares,saved. For VIDEO/REEL add: plays,ig_reels_avg_watch_time,ig_reels_video_view_total_time. For STORY: exits,replies,taps_forward,taps_back"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const metric = args.metric ||
                "impressions,reach,total_interactions,likes,comments,shares,saved";
            const data = await apiRequest(`/${args.media_id}/insights`, "GET", undefined, { metric });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get media insights: ${error.message}`);
        }
    });
    server.registerTool("get_audience_demographics", {
        title: "Get Audience Demographics",
        description: "Get follower demographics breakdown (city, country, age, gender). Requires at least 100 followers.",
        inputSchema: {
            breakdown: z
                .enum(["city", "country", "age", "gender"])
                .describe("Demographic dimension to break down by"),
            metric_type: z
                .enum(["total_value", "time_series"])
                .optional()
                .describe("Result type (default: total_value)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const data = await apiRequest(`/${INSTAGRAM_ACCOUNT_ID}/insights`, "GET", undefined, {
                metric: "follower_demographics",
                period: "lifetime",
                metric_type: args.metric_type || "total_value",
                breakdown: args.breakdown,
            });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get audience demographics: ${error.message}`);
        }
    });
}
function toTimestamp(dateStr) {
    if (!dateStr)
        return undefined;
    // Already a unix timestamp
    if (/^\d{10,}$/.test(dateStr))
        return dateStr;
    // Convert YYYY-MM-DD to unix timestamp
    const ts = Math.floor(new Date(dateStr).getTime() / 1000);
    return isNaN(ts) ? dateStr : String(ts);
}
