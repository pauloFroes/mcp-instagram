<p align="center">
  <img src="assets/instagram-logo.png" alt="instagram Logo" width="120" />
</p>

# mcp-instagram

MCP server that wraps the Instagram Graph API as semantic tools for LLM agents.

Works with **Claude Code**, **Codex**, **Claude Desktop**, **Cursor**, **VS Code**, **Windsurf**, and any MCP-compatible client.

---

## Use Cases & Examples

> Real prompts you can use with this MCP server:

- **"Show me my Instagram profile stats"** — Returns follower count, bio, media count, and profile picture
- **"Publish this photo to my feed with a caption"** — Uploads and publishes a photo from a public URL
- **"What are my top performing posts this month?"** — Lists posts sorted by engagement (likes + comments)
- **"Reply to the latest comments on my last post"** — Lists comments and lets you reply directly
- **"Show my audience demographics"** — Breaks down followers by city, country, age, and gender
- **"Search for trending posts with #marketing"** — Finds top media for any hashtag

---

## Prerequisites

- Node.js 18+
- Instagram Business or Creator account connected to a Facebook Page
- Meta access token with Instagram Graph API permissions

| Variable | Where to find |
| -------- | ------------- |
| `META_ACCESS_TOKEN` | [developers.facebook.com](https://developers.facebook.com) → Instagram Graph API → Generate Token |
| `INSTAGRAM_ACCOUNT_ID` | [Graph API Explorer](https://developers.facebook.com/tools/explorer/): `GET /me/accounts` → Page ID → `GET /{page-id}?fields=instagram_business_account` |

## Installation

### Claude Code

Three installation scopes are available:

| Scope | Flag | Config file | Use case |
|-------|------|-------------|----------|
| **local** | `-s local` | `.mcp.json` | This project only (default) |
| **project** | `-s project` | `.claude/mcp.json` | Shared with team via git |
| **user** | `-s user` | `~/.claude/mcp.json` | All your projects |

**Quick setup (inline env vars):**

```bash
claude mcp add instagram -s user \
  -e META_ACCESS_TOKEN=your-token \
  -e INSTAGRAM_ACCOUNT_ID=your-account-id \
  -- npx -y github:pauloFroes/mcp-instagram
```

> Replace `-s user` with `-s local` or `-s project` as needed.

**Persistent setup (.env file):**

Add to your `.mcp.json`:

```json
{
  "instagram": {
    "command": "npx",
    "args": ["-y", "github:pauloFroes/mcp-instagram"],
    "env": {
      "META_ACCESS_TOKEN": "${META_ACCESS_TOKEN}",
      "INSTAGRAM_ACCOUNT_ID": "${INSTAGRAM_ACCOUNT_ID}"
    }
  }
}
```

Then define the values in your `.env` file:

```
META_ACCESS_TOKEN=your-token
INSTAGRAM_ACCOUNT_ID=your-account-id
```

### Codex

Add to your Codex configuration:

```toml
[mcp_servers.instagram]
command = "npx"
args = ["-y", "github:pauloFroes/mcp-instagram"]
env_vars = ["META_ACCESS_TOKEN", "INSTAGRAM_ACCOUNT_ID"]
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "instagram": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-instagram"],
      "env": {
        "META_ACCESS_TOKEN": "your-token",
        "INSTAGRAM_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "instagram": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-instagram"],
      "env": {
        "META_ACCESS_TOKEN": "your-token",
        "INSTAGRAM_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "instagram": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-instagram"],
      "env": {
        "META_ACCESS_TOKEN": "your-token",
        "INSTAGRAM_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "instagram": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-instagram"],
      "env": {
        "META_ACCESS_TOKEN": "your-token",
        "INSTAGRAM_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

## Available Tools

### Profile

| Tool | Description |
|------|-------------|
| `get_profile` | Get account profile — username, bio, follower/following count, media count, profile picture |
| `get_media_detail` | Get detailed info about a specific post by ID — caption, type, URL, permalink, likes, comments |

### Media

| Tool | Description |
|------|-------------|
| `list_media` | List recent posts with pagination (reverse chronological order) |
| `list_stories` | List currently active stories (available for 24h after publishing) |
| `list_top_media` | Fetch recent posts sorted by engagement (likes + comments) |
| `list_children` | List individual items of a carousel album post |

### Publishing

| Tool | Description |
|------|-------------|
| `publish_photo` | Publish a photo to feed from a public image URL |
| `publish_reel` | Publish a Reel (short video) from a public video URL |
| `publish_carousel` | Publish a carousel album with 2-10 images/videos |
| `publish_story` | Publish a story (image or video) — disappears after 24h |

### Insights

| Tool | Description |
|------|-------------|
| `get_account_insights` | Account-level metrics — impressions, reach, profile views, website clicks, follower count |
| `get_media_insights` | Post-level metrics — impressions, reach, engagement, saved, video views |
| `get_audience_demographics` | Follower breakdown by city, country, age, and gender (requires 100+ followers) |

### Community

| Tool | Description |
|------|-------------|
| `list_comments` | List comments on a post — text, author, timestamp, like count, reply count |
| `reply_to_comment` | Reply to a comment (appears as nested response) |
| `delete_comment` | Delete a comment (irreversible) |

### Discovery

| Tool | Description |
|------|-------------|
| `search_hashtag` | Search for a hashtag and get its ID (limited to 30 unique searches per 7 days) |
| `get_hashtag_top_media` | Get top media posts for a hashtag ID |

## Authentication

This server uses the **Facebook Graph API v25.0** with a Meta access token. The token must have the following permissions:

- `instagram_basic` — Read profile and media
- `instagram_content_publish` — Publish posts, reels, stories, and carousels
- `instagram_manage_comments` — Read, reply, and delete comments
- `instagram_manage_insights` — Access account and media insights
- `pages_show_list` — Access connected Facebook Pages
- `pages_read_engagement` — Read page engagement data

Generate your token at [developers.facebook.com](https://developers.facebook.com) using the [Graph API Explorer](https://developers.facebook.com/tools/explorer/) or a System User in Meta Business Manager.

## License

MIT
