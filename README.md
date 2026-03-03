<p align="center">
  <img src="assets/instagram-logo.png" alt="instagram Logo" width="120" />
</p>

# mcp-instagram

MCP server that wraps the instagram API as semantic tools for LLM agents.

Works with **Claude Code**, **Codex**, **Claude Desktop**, **Cursor**, **VS Code**, **Windsurf**, and any MCP-compatible client.

---

## Use Cases & Examples

> Real prompts you can use with this MCP server:

- **"Example prompt 1"** — Description of what happens
- **"Example prompt 2"** — Description of what happens
- **"Example prompt 3"** — Description of what happens

---

## Prerequisites

- Node.js 18+
- instagram API credentials

| Variable | Where to find |
| -------- | ------------- |
| `INSTAGRAM_API_KEY` | TODO: add description |

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
  -e INSTAGRAM_API_KEY=your-key \
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
      "INSTAGRAM_API_KEY": "\${INSTAGRAM_API_KEY}"
    }
  }
}
```

Then define the values in your `.env` file:

```
INSTAGRAM_API_KEY=your-key
```

> See `.env.example` for all required variables.

### Codex

Add to your Codex configuration:

```toml
[mcp_servers.instagram]
command = "npx"
args = ["-y", "github:pauloFroes/mcp-instagram"]
env_vars = ["INSTAGRAM_API_KEY"]
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
        "INSTAGRAM_API_KEY": "your-key"
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
        "INSTAGRAM_API_KEY": "your-key"
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
        "INSTAGRAM_API_KEY": "your-key"
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
        "INSTAGRAM_API_KEY": "your-key"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_items` | TODO: add tools |

## Authentication

TODO: describe how authentication works internally.

## License

MIT
