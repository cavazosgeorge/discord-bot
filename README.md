# Discord Bot

Basic Discord bot scaffold using `Node.js`, `TypeScript`, and `discord.js`.

## Prerequisites

- Node.js `24+`
- `bun`
- A Discord application with a bot user already added to your test server

## Local Setup

1. Make sure `node -v` reports `24+`.
2. Make sure `bun --version` works.
3. Copy `.env.example` to `.env`.
4. Fill in:
   - `DISCORD_TOKEN`: from the Discord Developer Portal `Bot` page
   - `DISCORD_APPLICATION_ID`: from `General Information`
   - `DISCORD_GUILD_ID`: your private server ID
5. Install dependencies:

```bash
bun install
```

6. Register the slash commands in your server:

```bash
bun run register
```

7. Start the bot in watch mode:

```bash
bun run dev
```

The bot stores reminders in `data/reminders.sqlite`, which is created for you at runtime.

## Getting Your Guild ID

1. In Discord, open `User Settings > Advanced`.
2. Enable `Developer Mode`.
3. Right-click your server and choose `Copy Server ID`.

## Included Commands

- `/ping`: replies with `Pong!`
- `/hello`: replies with a greeting
- `/remind`: stores a reminder and sends it later, even after a restart
- `/userinfo`: shows your account and server join details
- `/serverinfo`: shows basic information about the current server
