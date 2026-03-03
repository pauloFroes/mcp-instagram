#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProfileTools } from "./tools/profile.js";
import { registerMediaTools } from "./tools/media.js";
import { registerPublishTools } from "./tools/publish.js";
import { registerInsightTools } from "./tools/insights.js";
import { registerCommunityTools } from "./tools/community.js";
import { registerDiscoveryTools } from "./tools/discovery.js";
const server = new McpServer({
    name: "mcp-instagram",
    version: "1.0.0",
});
registerProfileTools(server);
registerMediaTools(server);
registerPublishTools(server);
registerInsightTools(server);
registerCommunityTools(server);
registerDiscoveryTools(server);
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("mcp-instagram server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
