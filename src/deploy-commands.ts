import { REST, Routes } from "discord.js";

import { commands } from "./commands/index.js";
import { env } from "./config.js";

async function main() {
  const rest = new REST().setToken(env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(
      env.DISCORD_APPLICATION_ID,
      env.DISCORD_GUILD_ID,
    ),
    {
      body: commands.map((command) => command.data.toJSON()),
    },
  );

  console.log(
    `Registered ${commands.length} command(s) for guild ${env.DISCORD_GUILD_ID}.`,
  );
}

main().catch((error) => {
  console.error("Failed to register application commands.");
  console.error(error);
  process.exit(1);
});
