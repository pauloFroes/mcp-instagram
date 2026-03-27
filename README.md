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
- A Meta App with the Instagram API configured

| Variable | Description |
| -------- | ----------- |
| `META_ACCESS_TOKEN` | Facebook User token with Instagram permissions |
| `INSTAGRAM_ACCOUNT_ID` | Your Instagram Business Account ID |

---

## Getting Your Credentials

### Step 1: Create or configure a Meta App

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Create a new app or select an existing one
3. Go to **Use Cases** in the left sidebar
4. Find **"Gerenciar mensagens e conteúdo no Instagram"** (Manage Instagram messages and content) and click **Customize**
5. **Important:** Click on **"API setup with Facebook login"** (not the default Instagram API login). The MCP uses the Facebook Graph API, which requires this flow for hashtags, insights, and publishing

### Step 2: Add required permissions

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app in the **"App da Meta"** dropdown
3. **Important:** Make sure the domain is set to **`graph.facebook.com/`** (not `.instagram.com/`). Using the Instagram domain will cause "Invalid platform app" errors
4. Set **"Usuário ou Página"** to **"Token do usuário"** (User Token)
5. In the **Permissions** section, add all of these:
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_comments`
   - `instagram_manage_insights`
   - `instagram_manage_messages`
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_engagement`
   - `business_management`
6. Click **"Generate Access Token"**
7. Authorize all permissions in the popup
8. Copy the generated token — this is your `META_ACCESS_TOKEN`

> **Note:** Do NOT use the blue "Generate Instagram Access Token" button — it uses a different auth flow that may cause "Invalid platform app" errors.

### Step 3: Get your Instagram Account ID

1. In the [Graph API Explorer](https://developers.facebook.com/tools/explorer/), with the token generated above
2. Make sure the domain is **`graph.facebook.com/`**
3. Enter this query and click **Send**:

```
me/accounts?fields=instagram_business_account,name
```

4. In the response, find the `instagram_business_account.id` — this is your `INSTAGRAM_ACCOUNT_ID`:

```json
{
  "data": [
    {
      "instagram_business_account": {
        "id": "17841403450820551"  // ← this is your INSTAGRAM_ACCOUNT_ID
      },
      "name": "Your Page Name",
      "id": "110940624565411"
    }
  ]
}
```

### Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid platform app` | Using `.instagram.com/` domain or the blue "Generate Instagram Access Token" button | Switch to `graph.facebook.com/` domain and use the regular "Generate Access Token" button |
| `Invalid OAuth access token` (code 190) | Token expired | Generate a new token in Graph API Explorer |
| `me/accounts` returns empty `data: []` | Missing `pages_show_list` permission | Add `pages_show_list` permission and regenerate the token |
| `Missing required environment variable` | `META_ACCESS_TOKEN` or `INSTAGRAM_ACCOUNT_ID` not set | Check your env vars in the MCP config |

> **Token expiration:** Tokens from Graph API Explorer are short-lived (~1-2 hours). For production use, [extend your token](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/) to a long-lived token (~60 days) or use a System User token from Meta Business Manager (never expires).

---

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

---

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

---

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
