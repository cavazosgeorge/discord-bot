import { SlashCommandBuilder } from "discord.js";

import type { Command } from "../types/command.js";

export const serverInfoCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Show information about this server."),
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const createdAt = Math.floor(interaction.guild.createdTimestamp / 1000);

    await interaction.reply({
      content: [
        `Server: ${interaction.guild.name}`,
        `Server ID: ${interaction.guild.id}`,
        `Members: ${interaction.guild.memberCount}`,
        `Created: <t:${createdAt}:F>`,
      ].join("\n"),
    });
  },
};
